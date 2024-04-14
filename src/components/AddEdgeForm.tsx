import { NodeType } from "@/types"

type AddEdgeFormPropType = {
  nodes: NodeType[]
  edgeSourceID: string
  edgeDestinationID: string
  isBiDirectionalEdge: boolean
  setIsBiDirectionalEdge: React.Dispatch<React.SetStateAction<boolean>>
  handleAddEdge: () => void
  handleResetEdge: () => void
  setIsAddingEdge: React.Dispatch<React.SetStateAction<boolean>>
}

export default function AddEdgeForm({
  nodes,
  edgeSourceID,
  edgeDestinationID,
  isBiDirectionalEdge,
  setIsBiDirectionalEdge,
  handleAddEdge,
  handleResetEdge,
  setIsAddingEdge
}: AddEdgeFormPropType) {
  return (
    <div className="m-2 p-2 max-w-52 absolute top-0 right-0 bg-neutral-50 border border-neutral-400 rounded shadow">
      <p className="text-xs">Select <b>source node</b> first & then <b>destination node</b>.</p>
      <div className="my-2">
        <p className="text-sm">
          Source : {
            edgeSourceID === ''
              ? <span className="text-neutral-400">NA</span>
              : nodes.find(node => node.id === edgeSourceID)?.data
          }
        </p>
        <p className="text-sm">
          Destination : {
            edgeDestinationID === ''
              ? <span className="text-neutral-400">NA</span>
              : nodes.find(node => node.id === edgeDestinationID)?.data
          }
        </p>
        <p className="text-sm">
          <input type="checkbox" checked={isBiDirectionalEdge} onChange={(e) => setIsBiDirectionalEdge(e.target.checked)} /> Bi-directional Edge
        </p>
      </div>
      <div className="flex gap-1">
        <button className="px-2 py-1 text-xs bg-neutral-100 text-neutral-900 active:bg-neutral-200" onClick={handleAddEdge}>Add Edge</button>
        <button className="px-2 py-1 text-xs" onClick={handleResetEdge}>Reset</button>
        <button className="px-2 py-1 text-xs" onClick={() => setIsAddingEdge(false)}>Close</button>
      </div>
    </div>
  )
}