# -*- coding: utf-8 -*-
import re
import os
import pandas as pd
import numpy as np
import faiss
from collections import defaultdict
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any
from fastapi import HTTPException

from models.hscode import SearchRequest, SearchResult

class HSCodeSearchService:
    def __init__(self):
        self.df_combined = None
        self.df10 = None
        self.df11 = None
        self.df_propre = None
        self.combined = None
        self.df_content = None
        self.mapping = None
        self.embeddings = None
        self.index = None
        self.model = None
        self.loaded = False

    def load_data_and_models(self):
        """Load all data and models during startup"""
        try:
            # Get current directory
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            
            # Define paths based on folder structure
            data_dir = os.path.join(base_dir, "data")
            faiss_dir = os.path.join(base_dir, "faiss_artifacts")
            
            # File paths
            file1 = os.path.join(data_dir, "df_Extraction_final.csv")
            file10 = os.path.join(data_dir, "df1_updated.csv")
            file11 = os.path.join(data_dir, "hs_code.csv")
            content_file = os.path.join(data_dir, "df_full_content.csv")
            
            # Check if files exist
            required_files = [file1, file10, file11, content_file]
            for file_path in required_files:
                if not os.path.exists(file_path):
                    print(f"Warning: Required file not found: {file_path}")
                    return False
            
            # Load datasets
            self.df_combined = pd.read_csv(file1)
            self.df10 = pd.read_csv(file10)
            self.df11 = pd.read_csv(file11)
            
            # Preprocess data
            self.df_propre = self.supprimer_hs_codes_anormaux(self.df_combined)
            self.df_propre = self.detect_descriptions_suspectes(self.df_propre)
            self.df_propre["Description"] = self.df_propre["Description"].fillna(
                self.df_propre["Product Name"]
            )
            # Drop temporary column
            if "Description_Suspecte" in self.df_propre.columns:
                self.df_propre.drop(columns=["Description_Suspecte"], inplace=True)
            
            self.df11['HS Code'] = self.df11['HS Code'].str.replace(r'[ .]', '', regex=True)
            
            # Combine datasets
            self.combined = pd.concat([
                self.df_propre.assign(_source='df_propre'),
                self.df10.assign(_source='df10'),
                self.df11.assign(_source='df11')
            ], ignore_index=True)
            
            # Load content mapping
            self.df_content = pd.read_csv(content_file)
            self.mapping = dict(zip(self.df_content['filename'], self.df_content['content']))
            
            # Load FAISS artifacts
            embeddings_path = os.path.join(faiss_dir, 'embeddings.npy')
            index_path = os.path.join(faiss_dir, 'faiss_index.bin')
            model_path = os.path.join(faiss_dir, 'sbert_paraphrase_MiniLM-L6-v2')
            
            # Check if FAISS files exist
            faiss_files = [embeddings_path, index_path]
            for file_path in faiss_files:
                if not os.path.exists(file_path):
                    print(f"Warning: FAISS file not found: {file_path}")
                    return False
            
            self.embeddings = np.load(embeddings_path)
            self.index = faiss.read_index(index_path)
            
            # Load model
            if os.path.exists(model_path):
                self.model = SentenceTransformer(model_path)
            else:
                # Fallback to downloading the model
                self.model = SentenceTransformer('paraphrase-MiniLM-L6-v2')
            
            self.loaded = True
            return True
            
        except Exception as e:
            print(f"Error loading HS Code search data: {str(e)}")
            return False

    def supprimer_hs_codes_anormaux(self, df, hs_column="HS Code"):
        """Remove anomalous HS codes"""
        def is_anomalous(code):
            if pd.isnull(code):
                return True
            code_str = str(code).strip()
            if not re.fullmatch(r"\d{6,10}", code_str):
                return True
            return False

        df["HS_Code_Anormal"] = df[hs_column].apply(is_anomalous)
        df_clean = df[~df["HS_Code_Anormal"]].copy()
        df_clean.drop(columns=["HS_Code_Anormal"], inplace=True)
        return df_clean

    def detect_descriptions_suspectes(self, df, desc_column="Description"):
        """Detect suspicious descriptions"""
        def is_invalid_description(desc):
            if pd.isnull(desc):
                return True
            desc_str = str(desc).strip().lower()
            if len(desc_str) < 5:
                return True
            if re.fullmatch(r"[^\w\s]+", desc_str) or re.fullmatch(r"\d+", desc_str):
                return True
            if desc_str in ["n/a", "na", "null", "none", "vide"]:
                return True
            return False

        df["Description_Suspecte"] = df[desc_column].apply(is_invalid_description)
        return df

    def get_rubrique(self, file_name):
        """Get rubrique based on file name"""
        if not isinstance(file_name, str):
            return ""
        fname = file_name.lower()
        if re.match(r'^chapitre\s*\d+\.docx$', fname):
            return "note explicative"
        elif re.match(r'^modification session\s*\d+\.pdf$', fname):
            return "decision OMD"
        elif re.match(r'^affaire\s+.+\.pdf$', fname):
            return "court case"
        else:
            return ""

    def get_name(self, code):
        """Get product name for HS code"""
        for df in (self.df11, self.df10, self.df_propre):
            if 'HS Code' in df.columns and 'Product Name' in df.columns:
                m = df[df['HS Code'].astype(str) == code]
                if not m.empty:
                    return m['Product Name'].iloc[0]
        return ''

    def get_file(self, code):
        """Get file name for HS code"""
        for df in (self.df11, self.df_propre):
            if 'HS Code' in df.columns and 'File Name' in df.columns:
                m = df[df['HS Code'].astype(str) == code]
                if not m.empty:
                    return m['File Name'].iloc[0]
        if 'HS Code' in self.df10.columns and 'filename' in self.df10.columns:
            m = self.df10[self.df10['HS Code'].astype(str) == code]
            if not m.empty:
                return m['filename'].iloc[0]
        return "à partir de hs_codes.csv"

    def search_hs_codes(self, request: SearchRequest) -> List[SearchResult]:
        """Main search function"""
        if not self.loaded:
            raise HTTPException(status_code=500, detail="HS Code search service not properly loaded")

        try:
            query_emb = self.model.encode([request.query], convert_to_numpy=True)
            faiss.normalize_L2(query_emb)
            D, I = self.index.search(query_emb, request.top_k)

            parent_scores = {}
            parents_seen = set()
            children_map = defaultdict(set)

            for score, idx in zip(D[0], I[0]):
                row = self.combined.iloc[idx]
                hs = str(row.get('HS Code', '')).strip()
                if len(hs) not in (6, 8):
                    continue
                p6 = hs[:6]
                parents_seen.add(p6)
                parent_scores[p6] = max(parent_scores.get(p6, 0), float(score))
                if len(hs) == 8:
                    children_map[p6].add(hs)

            for p6 in parents_seen:
                for df in (self.df11, self.df10, self.df_propre):
                    if 'HS Code' in df.columns:
                        codes = df['HS Code'].astype(str)
                        mask = codes.str.startswith(p6) & (codes.str.len() == 8)
                        for child in codes[mask].unique():
                            children_map[p6].add(child)

            nested_results = []

            for parent6, score in sorted(parent_scores.items(), key=lambda x: x[1], reverse=True):
                suffix_groups = defaultdict(list)
                for child in children_map[parent6]:
                    suffix_groups[child[-2:]].append(child)

                sous_codes = []
                chapitre_num = parent6[:2]
                chapitre_filename = f"Chapitre {chapitre_num}.docx"
                match = self.df_content[self.df_content['filename'].str.lower() == chapitre_filename.lower()]
                
                if not match.empty:
                    chapitre_contenu = match['content'].iloc[0]
                    sous_codes.append({
                        'sous_code': 'note',
                        'resultats': [{
                            'Description': f"Note explicative du Chapitre {chapitre_num}",
                            'File Name': chapitre_filename,
                            'rubrique': "note explicative",
                            'Similarité': None,
                            'contenu': chapitre_contenu
                        }]
                    })

                for suffix2, codes in suffix_groups.items():
                    resultats = []
                    for code in codes:
                        fname = self.get_file(code)
                        rubrique = self.get_rubrique(fname)
                        contenu = self.mapping.get(fname, '')
                        desc = self.get_name(code)

                        if not rubrique and len(code) == 8:
                            match_df10 = self.df10[self.df10['HS Code'].astype(str) == code]
                            if not match_df10.empty:
                                rubrique = "decision OMD"
                                fname = match_df10['filename'].iloc[0]
                                contenu = match_df10['Description'].iloc[0]
                        elif not rubrique and len(code) == 6:
                            match_df_propre = self.df_propre[self.df_propre['HS Code'].astype(str) == code]
                            if not match_df_propre.empty:
                                rubrique = "note explicative"
                                desc = match_df_propre['Description'].iloc[0]
                                contenu = desc

                        resultats.append({
                            'Description': desc,
                            'File Name': fname,
                            'rubrique': rubrique,
                            'Similarité': score,
                            'contenu': contenu
                        })

                    sous_codes.append({
                        'sous_code': suffix2,
                        'resultats': resultats
                    })

                parent_fname = self.get_file(parent6)
                parent_rubrique = self.get_rubrique(parent_fname)
                parent_contenu = self.mapping.get(parent_fname, '')
                parent_desc = self.get_name(parent6)

                match_df_parent = self.df_propre[self.df_propre['HS Code'].astype(str) == parent6]
                if not parent_rubrique and not match_df_parent.empty:
                    parent_rubrique = "note explicative"
                    parent_desc = match_df_parent['Description'].iloc[0]
                    parent_contenu = parent_desc

                nested_results.append(SearchResult(
                    HS_Code=parent6,
                    Product_Name=parent_desc,
                    File_Name=parent_fname,
                    rubrique=parent_rubrique,
                    score=score,
                    contenu=parent_contenu,
                    sous_codes=sous_codes
                ))

            return nested_results

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error during HS code search: {str(e)}")

# Global instance
hs_search_service = HSCodeSearchService()