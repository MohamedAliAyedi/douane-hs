import React from "react";
import { Collapsible, CollapsibleContent } from "../ui/collapsible";

export interface TreeItem {
    id: string;
    label: string;
    value?: string;
    keyword?: string;
    children?: TreeItem[];
    restricted?: boolean;
  }

export const TreeNode: React.FC<{
    item: TreeItem;
    level: number;
    isLast: boolean;
    setSelectedHsCode: (id: string) => void;
  }> = ({ item, level, isLast, setSelectedHsCode }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <div className={`relative ${level > 0 ? "ml-16" : ""}`}>
        {level > 0 && (
          <div
            className={`absolute left-0 top-0 bottom-0 border-l border-gray-500 ${
              isLast ? "h-1/2" : ""
            }`}
            style={{ left: "-1.5rem" }}
          ></div>
        )}
        <Collapsible
          open={isOpen}
          onOpenChange={(value: boolean) => {
            setIsOpen(value);
            if (item.children && value === true) {
              setSelectedHsCode(item.id);
            }
          }}
        >
          <div
            className={`flex items-center cursor-pointer ${
              level > 0 ? "py-5" : "pt-5"
            } `}
            onClick={() => {
              if(level !== 0 || !item.children) {
                setSelectedHsCode(item.id);
              }
              else {
                if (!isOpen && item.children) {
                  setIsOpen(true);
                } else {
                  setSelectedHsCode(item.id);
                  setIsOpen(false);
                }
              }
            }}
          >
            {level > 0 && (
              <div
                className="absolute w-6 border-t border-gray-500"
                style={{ left: "-1.5rem" }}
              ></div>
            )}
            <div className="flex-1 flex items-center space-x-2">
              <span className="text-blue-600 flex justify-center items-center w-20 rounded-md border-2 border-blue-600 px-2 py-0.5 rounded font-medium">
                {item.id}
                {item.restricted && (
                  <div className="bg-gray-200 ml-2 pl-1 pr-1 rounded-md">
                    <p className="text-black font-bold text-xs">R</p>
                  </div>
                )}
              </span>
              <span className="w-1/2 text-md">{item.label}</span>
              {item.value && (
                <span className="w-1/6 text-gray-500 text-center">{item.value}</span>
              )}
              {item.keyword && (
                <span className="w-1/8 flex-1/2 text-gray-500 text-center">{item.keyword}</span>
              )}
            </div>
          </div>
          {item.children && typeof item.children != "string" && (
            <CollapsibleContent>
              {item.children.map((child, index) => (
                <TreeNode
                  key={`${item.id}${child.id}`}
                  item={{
                    ...child,
                    id: `${item.id}${child.id}`,
                  }}
                  level={level + 1}
                  isLast={item.children != null && index === item.children.length - 1}
                  setSelectedHsCode={setSelectedHsCode}
                />
              ))}
            </CollapsibleContent>
          )}
        </Collapsible>
      </div>
    );
  };