'use client'

import { useEffect, useState } from "react"
import { EdgeType, NodeType } from "@/types"
import { FaTimes, FaUndoAlt } from "react-icons/fa"

type NodeInfoModalPropType = {
  nodes: NodeType[]
  edges: EdgeType[]
  setEdges: React.Dispatch<React.SetStateAction<EdgeType[]>>
  mouseOverNode: NodeType
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function NodeInfoModal({ nodes, edges, setEdges, mouseOverNode, setIsModalOpen }: NodeInfoModalPropType) {

  const [nodeName, setNodeName] = useState(mouseOverNode.data)
  const [isDirty, setIsDirty] = useState(false)
  const [deleteInflowEdgesNodeIDs, setDeleteInflowEdgesNodeIDs] = useState<string[]>([])
  const [deleteOutflowEdgesNodeIDs, setDeleteOutflowEdgesNodeIDs] = useState<string[]>([])

  const mouseOverNodeInFlowEdges = edges.filter(edge => edge.destination.id === mouseOverNode?.id)
  const mouseOverNodeOutFlowEdges = edges.filter(edge => edge.source.id === mouseOverNode?.id)
  const mouseOverNodeInFlowNodes = mouseOverNodeInFlowEdges.map(edge => nodes.find(node => node.id === edge.source.id))
  const mouseOverNodeOutFlowNodes = mouseOverNodeOutFlowEdges.map(edge => nodes.find(node => node.id === edge.destination.id))

  const handleSave = () => {
    if (nodeName) {
      mouseOverNode.data = nodeName
      let tempEdges = edges
      if (deleteInflowEdgesNodeIDs.length !== 0) {
        deleteInflowEdgesNodeIDs.forEach(node => {
          tempEdges = tempEdges.filter(edge => !(edge.destination.id === mouseOverNode.id && edge.source.id === node))
        })
        setDeleteInflowEdgesNodeIDs([])
      }
      if (deleteOutflowEdgesNodeIDs.length !== 0) {
        deleteOutflowEdgesNodeIDs.forEach(node => {
          tempEdges = tempEdges.filter(edge => !(edge.source.id === mouseOverNode.id && edge.destination.id === node))
        })
        setDeleteOutflowEdgesNodeIDs([])
      }
      setEdges(tempEdges)
      setIsDirty(false)
    }
  }

  const deleteInflowEdge = (node: undefined | NodeType) => {
    if (node) {
      setDeleteInflowEdgesNodeIDs(prev => [...prev, node.id])
    }
  }

  const deleteOutflowEdge = (node: undefined | NodeType) => {
    if (node) {
      setDeleteOutflowEdgesNodeIDs(prev => [...prev, node.id])
    }
  }

  const undoDeleteInflowEdge = (node: undefined | NodeType) => {
    setDeleteInflowEdgesNodeIDs(deleteInflowEdgesNodeIDs.filter(nodeID => nodeID !== node?.id))
  }

  const undoDeleteOutflowEdge = (node: undefined | NodeType) => {
    setDeleteOutflowEdgesNodeIDs(deleteOutflowEdgesNodeIDs.filter(nodeID => nodeID !== node?.id))
  }

  useEffect(() => {
    if (nodeName !== mouseOverNode.data || deleteInflowEdgesNodeIDs.length !== 0 || deleteOutflowEdgesNodeIDs.length !== 0) {
      setIsDirty(true)
    } else {
      setIsDirty(false)
    }
  })

  return (
    <div className="z-50 fixed top-0  w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
      <div className="relative px-6 py-4 w-2/3 min-w-96 max-w-3xl bg-neutral-100 text-neutral-900 rounded shadow-md">
        <span className="absolute p-2 top-0 right-0 cursor-pointer" onClick={() => setIsModalOpen(false)}><FaTimes /></span>
        <h2 className="mb-4 text-2xl text-center">Node Info</h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <strong className="">Data:</strong>
            <input className="w-full p-1" type="text" value={nodeName} onChange={e => setNodeName(e.target.value)} />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <p className=""><strong>In-Flow:</strong></p>
              <p className="font-mono flex gap-1 flex-wrap">
                {
                  mouseOverNodeInFlowNodes.length > 0
                    ? mouseOverNodeInFlowNodes.map(node => {
                      const nodeWillBeDeleted = deleteInflowEdgesNodeIDs.includes(node?.id || '')
                      return (
                        <span key={node?.data}>
                          <span className={`min-w-max mb-1 px-2 py-1 bg-neutral-900 text-neutral-100 flex items-center gap-1 rounded${nodeWillBeDeleted ? ' bg-red-600' : ''}`}>
                            {node?.data}
                            {
                              nodeWillBeDeleted
                                ? <FaUndoAlt className="p-0.5 text-base cursor-pointer" onClick={() => undoDeleteInflowEdge(node)} />
                                : <FaTimes className="p-0.5 text-base cursor-pointer" onClick={() => deleteInflowEdge(node)} />
                            }
                          </span>
                        </span>
                      )
                    })
                    : <span className="text-neutral-500">NA</span>
                }
              </p>
            </div>
            <div className="flex-1">
              <p className=""><strong>Out-Flow:</strong></p>
              <p className="font-mono flex gap-1">
                {
                  mouseOverNodeOutFlowNodes.length > 0
                    ? mouseOverNodeOutFlowNodes.map(node => {
                      const nodeWillBeDeleted = deleteOutflowEdgesNodeIDs.includes(node?.id || '')
                      return (
                        <span key={node?.data}>
                          <span className={`min-w-max mb-1 px-2 py-1 bg-neutral-900 text-neutral-100 flex items-center gap-1 rounded${nodeWillBeDeleted ? ' bg-red-600' : ''}`}>
                            {node?.data}
                            {
                              nodeWillBeDeleted
                                ? <FaUndoAlt className="p-0.5 text-base cursor-pointer" onClick={() => undoDeleteOutflowEdge(node)} />
                                : <FaTimes className="p-0.5 text-base cursor-pointer" onClick={() => deleteOutflowEdge(node)} />
                            }
                          </span>
                        </span>
                      )
                    })
                    : <span className="text-neutral-500">NA</span>
                }
              </p>
            </div>
          </div>
          <div>
            <button onClick={handleSave} disabled={!isDirty}>Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}