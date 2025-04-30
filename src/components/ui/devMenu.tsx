import { useState } from "react";
import Button from "./button";
import { usePeer } from "../../utils/PeerProvider";

const DevMenu = () => {
  const { conn, user } = usePeer();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleConnectionLost = () => {
    if (!user) return;
    conn.forEach((c) => {
      c.close();
    });
  };
  return (
    <div className="fixed bottom-0 right-0 m-2 z-50">
      <div className="bg-neutral-800 p-2 rounded-lg shadow-lg">
        <div className="flex justify-between items-center">
          <Button
            className="w-full text-xs"
            variant="primary"
            onClick={() => setIsCollapsed(!isCollapsed)}>
            Dev
          </Button>
        </div>
        {!isCollapsed && (
          <div className="mt-2 flex flex-col gap-1 max-h-20 overflow-y-auto">
            <Button onClick={handleConnectionLost} className="text-xs">Simulate Connection lost</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevMenu;
