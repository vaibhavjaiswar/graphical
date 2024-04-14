'use client'

import { NodeType, MouseClickStateType, Coords2DType, EdgeType } from "@/types"
import { generateUniqueID } from "@/utils"
import { clearFullCanvas, highlightNodeOnMouseClick, highlightNodeOnMouseHover, paintNodes } from "@/utils/canvas"
import { canvasHeight, canvasWidth } from "@/utils/constants"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import NodeInfoModal from "./NodeInfoModal"
import AddEdgeForm from "./AddEdgeForm"
import { FaDownload } from "react-icons/fa"

export default function Canvas() {

  const [nodes, setNodes] = useState<NodeType[]>([
    { id: generateUniqueID(), data: "Node 1", x: 600, y: 200, isMouseOver: false, isSelected: false },
    { id: generateUniqueID(), data: "Node 2", x: 400, y: 100, isMouseOver: false, isSelected: false },
    { id: generateUniqueID(), data: "Node 3", x: 200, y: 200, isMouseOver: false, isSelected: false },
    { id: generateUniqueID(), data: "Node 4", x: 200, y: 400, isMouseOver: false, isSelected: false },
    { id: generateUniqueID(), data: "Node 5", x: 400, y: 500, isMouseOver: false, isSelected: false },
    { id: generateUniqueID(), data: "Node 6", x: 600, y: 400, isMouseOver: false, isSelected: false },
    { id: generateUniqueID(), data: "Node 7", x: 400, y: 300, isMouseOver: false, isSelected: false },
  ])
  const [edges, setEdges] = useState<EdgeType[]>([])
  const [mouse, setMouse] = useState<Coords2DType>({ x: 0, y: 0 })
  const [mouseClickState, setMouseClickState] = useState<MouseClickStateType>('default')
  const [isCtrlKeyDown, setIsCtrlKeyDown] = useState(false)
  const [isAddingEdge, setIsAddingEdge] = useState(false)
  const [edgeSourceID, setEdgeSourceID] = useState<string>('')
  const [edgeDestinationID, setEdgeDestinationID] = useState<string>('')
  const [isBiDirectionalEdge, setIsBiDirectionalEdge] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const box = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  const mouseOverNode = nodes.find(node => node.isMouseOver)

  useEffect(() => {
    paintNodes(canvas, nodes, edges)
  }, [nodes, edges])

  const addNode = (x: number, y: number) => {
    const nodesArray = nodes.map(node => node)
    nodesArray.push({
      id: generateUniqueID(),
      data: `Node ${nodes.length + 1}`,
      x: x,
      y: y,
      isMouseOver: false,
      isSelected: false
    })
    setNodes(nodesArray)
  }

  const handleAddNewEdge = () => {
    if (nodes.length < 2) {
      alert('Minimum 2 nodes needed to add an edge!')
      return
    }
    if (isAddingEdge) {
      handleResetEdge()
    }
    setIsAddingEdge(!isAddingEdge)
    unselectNodes()
  }

  const handleAddEdge = () => {
    if (edgeSourceID === '' || edgeDestinationID === '') {
      alert('Please select source & destination nodes!')
      return
    }
    const edge = edges.find(edge => edge.source.id === edgeSourceID && edge.destination.id === edgeDestinationID)
    if (edge !== undefined) {
      alert('Edge is already added!')
      return
    }
    const edgesArray = edges.map(edge => edge)
    edgesArray.push({ id: generateUniqueID(), source: { id: edgeSourceID }, destination: { id: edgeDestinationID } })
    if (isBiDirectionalEdge) {
      edgesArray.push({ id: generateUniqueID(), source: { id: edgeDestinationID }, destination: { id: edgeSourceID } })
    }
    setEdges(edgesArray)
    handleResetEdge()
    setIsAddingEdge(false)
    setIsBiDirectionalEdge(false)
    unselectNodes()
  }

  const handleResetEdge = () => {
    setEdgeSourceID('')
    setEdgeDestinationID('')
    setIsBiDirectionalEdge(false)
    unselectNodes()
  }

  const handleClearAllNodes = () => {
    setNodes([])
    setEdges([])
    clearFullCanvas(canvas)
  }

  const handleDeleteNode = () => {
    let deletingNodeID = ''
    const remainingNodes = nodes.filter(node => {
      if (node.isSelected) {
        deletingNodeID = node.id
      }
      return !node.isSelected
    })
    if (deletingNodeID === '') {
      alert('Select a node to delete!')
    }
    const remainingEdges = edges.filter(edge => !(edge.source.id === deletingNodeID || edge.destination.id === deletingNodeID))
    setNodes(remainingNodes)
    setEdges(remainingEdges)
  }

  const unselectNodes = () => {
    const unselectedNodes = nodes.map(node => ({ ...node, isSelected: false }))
    setNodes(unselectedNodes)
  }

  // const someRandomLoggingFunction = () => {
  //   console.log(nodes.map(node => node))
  //   console.log(edges)
  // }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('data', 'new-node')
  }

  const handleDragOver = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault()

    const { clientX, clientY } = e
    const { top, left } = box.current?.getBoundingClientRect() as { top: number, left: number }
    const data = e.dataTransfer.getData('data')
    if (data === 'new-node') {
      addNode(clientX - left, clientY - top)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    e.preventDefault()

    const { clientX, clientY } = e
    const { top, left } = canvas.current?.getBoundingClientRect() as { top: number, left: number }
    const mouseX = clientX - Math.round(left)
    const mouseY = clientY - Math.round(top)
    setMouse({ x: mouseX, y: mouseY })

    highlightNodeOnMouseHover(nodes, { x: mouseX, y: mouseY })

    const mouseOnNode = nodes.find(node => node.isMouseOver && node.isSelected)
    if (mouseOnNode !== undefined && mouseClickState === "mouse-down") {
      const x = mouseOnNode.x
      const y = mouseOnNode.y
      mouseOnNode.x = mouseX
      mouseOnNode.y = mouseY
      const selectedNodes = nodes.filter(node => node.isSelected && node.id !== mouseOnNode?.id)
      selectedNodes.forEach(node => {
        node.x += mouseX - x
        node.y += mouseY - y
      })
    }

    paintNodes(canvas, nodes, edges)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    setMouseClickState("mouse-down")

    highlightNodeOnMouseClick(nodes, mouse, isCtrlKeyDown)

    const setNewEdgeNodes = () => {
      if (isAddingEdge) {
        if (edgeSourceID === '') {
          const selectedNode = nodes.find(node => node.isSelected)
          if (selectedNode !== undefined) {
            setEdgeSourceID(selectedNode.id)
          }
        } else if (edgeDestinationID === '') {
          const selectedNode = nodes.find(node => node.isSelected)
          if (edgeSourceID === selectedNode?.id) {
            alert('Destination node should be different!')
            return
          }
          if (selectedNode !== undefined) {
            setEdgeDestinationID(selectedNode.id)
          }
        }
      }
    }
    setNewEdgeNodes()

    paintNodes(canvas, nodes, edges)
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    setMouseClickState("default")
  }

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (mouseOverNode !== undefined) {
      setIsModalOpen(true)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey) {
      setIsCtrlKeyDown(true)
    } else if (e.key === 'a' || e.key === 'A') {
      handleAddNewEdge()
    } else if (e.key === 'd' || e.key === 'D') {
      handleDeleteNode()
    } else if (e.key === 'Enter') {
      if (isAddingEdge) {
        handleAddEdge()
      }
    }
  }

  const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    setIsCtrlKeyDown(false)
  }

  const handleSaveAsImage = () => {
    if (nodes.length < 1) {
      alert('No nodes added!')
      return
    }

    const ctx = canvas.current?.getContext("2d")

    let left = Infinity
    let top = Infinity
    let right = -Infinity
    let bottom = -Infinity
    let imageData = null

    if (ctx) {
      nodes.forEach(node => {
        const { x, y } = node
        if (x < left) left = x
        if (y < top) top = y
        if (x > right) right = x
        if (y > bottom) bottom = y
      })

      left -= 100
      top -= 100
      right += 100
      bottom += 100

      if (left < 0) left = 0
      if (top < 0) top = 0
      if (right > canvasWidth) right = canvasWidth
      if (bottom > canvasHeight) bottom = canvasHeight

      imageData = ctx.getImageData(left, top, right - left, bottom - top) as ImageData
    }

    if (imageData && left !== Infinity && top !== Infinity && right !== Infinity && bottom !== Infinity) {
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = right - left
      tempCanvas.height = bottom - top
      const tempCtx = tempCanvas.getContext('2d')
      tempCtx?.putImageData(imageData, 0, 0)
      const link = document.createElement('a')
      link.download = `GRAPH-ical graph image ${new Date().toLocaleString()}.png`
      link.href = tempCanvas.toDataURL()
      link.click()
      link.remove()
      tempCanvas.remove()
    }
  }

  return (
    <section>
      <div className="my-4 flex gap-4 justify-between">
        <div className="flex gap-4 justify-between items-center">
          <div
            className="w-16 h-16 p-2 font-semibold bg-neutral-900 text-neutral-100 flex justify-center items-center rounded-full cursor-grab active:cursor-grabbing"
            title="Drag and drop on canvas"
            draggable
            onDragStart={e => handleDragStart(e)}
          >
            Node
          </div>
          <div>
            <p>Mouse Coords</p>
            <p>x: {mouse.x} y: {mouse.y}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-between items-center">
          {/* <button onClick={someRandomLoggingFunction}>Click</button> */}
          <button onClick={handleAddNewEdge}>{isAddingEdge ? 'Close Box (A)' : 'Add Edge (A)'}</button>
          <button onClick={handleDeleteNode}>Delete Node (D)</button>
          <button onClick={handleClearAllNodes}>Clear All</button>
        </div>
      </div>
      <div className="relative">
        <div
          ref={box}
          className="relative min-h-[76vh] bg-white border rounded overflow-scroll shadow-lg"
          tabIndex={0}
          onKeyDown={e => handleKeyDown(e)}
          onKeyUp={e => handleKeyUp(e)}
        >
          <canvas
            ref={canvas}
            className="absolute"
            width={canvasWidth}
            height={canvasHeight}
            onDragOver={e => handleDragOver(e)}
            onDrop={e => handleDrop(e)}
            onMouseDown={e => handleMouseDown(e)}
            onMouseUp={e => handleMouseUp(e)}
            onMouseMove={e => handleMouseMove(e)}
            onDoubleClick={e => handleDoubleClick(e)}
          >
            HTML Canvas
          </canvas>
        </div>
        {isAddingEdge && <AddEdgeForm
          nodes={nodes}
          edgeSourceID={edgeSourceID}
          edgeDestinationID={edgeDestinationID}
          isBiDirectionalEdge={isBiDirectionalEdge}
          setIsBiDirectionalEdge={setIsBiDirectionalEdge}
          handleAddEdge={handleAddEdge}
          handleResetEdge={handleResetEdge}
          setIsAddingEdge={setIsAddingEdge}
        />}
        {
          isModalOpen && mouseOverNode && createPortal(
            <NodeInfoModal
              nodes={nodes}
              edges={edges}
              setEdges={setEdges}
              mouseOverNode={mouseOverNode}
              setIsModalOpen={setIsModalOpen}
            />,
            document.body
          )
        }
        <button className="m-4 p-3 absolute bottom-0 right-0 flex flex-col items-center gap-2" onClick={handleSaveAsImage} title="Save as image">
          <FaDownload />
        </button>
      </div>
    </section >
  )
}