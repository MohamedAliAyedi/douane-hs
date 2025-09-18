/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import { load as cocoModalLoad } from "@tensorflow-models/coco-ssd";

export default function ObjectDetection() {
  const imageEle = useRef<any>(null);
  const [objectDetector, setObjectDetector] = useState<any>(null);
  const [detectedObjects, setDetectedObjects] = useState<any[]>([]);
  const [uploadedImage, setUploadedImage] = useState<any>(null);

  const startDetecting = async () => {
    const image = tf.browser.fromPixels(imageEle.current);
    const predictions = await objectDetector.detect(image);
    setDetectedObjects(predictions);
  };

  const loadModel = async () => {
    const model = await cocoModalLoad();
    setObjectDetector(model);
  };

  useEffect(() => {
    loadModel();
  }, []);

  const setImage = (event: any) => {
    if (event.target.files && event.target.files[0]) {
      const image = event.target.files[0];
      setUploadedImage(URL.createObjectURL(image));
    }
  };

  return (
    <div>
      <h1>Object Detection</h1>
      <input type="file" onChange={setImage} />
      {uploadedImage && (
        <>
          <img ref={imageEle} src={uploadedImage} alt="Uploaded" width={500} className="hidden" />
          <button onClick={startDetecting}>Start Detection</button>
        </>
      )}
      {detectedObjects.length > 0 && (
        <div>
          <h2>Detected Objects:</h2>
          <ul>
            {detectedObjects.map((obj, index) => (
              <li key={index}>
                Object: {obj.class}, Confidence: {(obj.score * 100).toFixed(2)}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
