import { NodeType, Coords2DType, EdgeType } from "@/types"
import { arrowSize, canvasHeight, canvasWidth, nodeRadius } from "./constants"

export const clearFullCanvas = (canvas: React.RefObject<HTMLCanvasElement>) => {
  const ctx = canvas.current?.getContext("2d")
  if (ctx) {
    // ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  }
}

export const paintNodes = (canvas: React.RefObject<HTMLCanvasElement>, nodes: NodeType[], edges: EdgeType[]) => {
  clearFullCanvas(canvas)
  edges.forEach(edge => {
    const ctx = canvas.current?.getContext("2d")
    if (ctx) {
      const sourceNode = nodes.find(node => node.id === edge.source.id)
      const destinationNode = nodes.find(node => node.id === edge.destination.id)
      if (sourceNode !== undefined && destinationNode !== undefined) {
        drawEdge(ctx, sourceNode, destinationNode)
      }
    }
  })
  nodes.forEach(node => {
    const ctx = canvas.current?.getContext("2d")
    if (ctx) {
      drawNode(ctx, node)
    }
  })
}

const drawNode = (ctx: CanvasRenderingContext2D, node: NodeType) => {
  ctx.beginPath()

  ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI)

  ctx.fillStyle = node.isSelected ? '#3b82f6' : (node.isMouseOver ? '#e4e4e7' : '#ffffff')
  ctx.fill()

  ctx.strokeStyle = '#171717'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.closePath()

  ctx.font = '16px Monospace'
  ctx.fillStyle = '#171717'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const nodeText = 7 < node.data.length ? node.data.substring(0, 6) + '..' : node.data
  ctx.fillText(nodeText, node.x, node.y)
}

const drawEdge = (ctx: CanvasRenderingContext2D, sourceNode: NodeType, destinationNode: NodeType) => {
  ctx.beginPath()
  ctx.moveTo(sourceNode.x, sourceNode.y)
  ctx.lineTo(destinationNode.x, destinationNode.y)
  ctx.strokeStyle = '#171717'
  ctx.lineWidth = 2
  ctx.stroke()

  const angle = Math.atan2(destinationNode.y - sourceNode.y, destinationNode.x - sourceNode.x)
  const pointX = destinationNode.x - nodeRadius * Math.cos(angle)
  const pointY = destinationNode.y - nodeRadius * Math.sin(angle)

  ctx.save()
  ctx.translate(pointX, pointY)
  ctx.rotate(angle)

  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(-arrowSize * 2, arrowSize)
  ctx.lineTo(-arrowSize * 2, -arrowSize)
  ctx.closePath()
  ctx.fillStyle = '#171717'
  ctx.fill()

  ctx.restore()
}

export const highlightNodeOnMouseHover = (nodes: NodeType[], mouse: Coords2DType) => {
  let isMouseOverNode = false
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i]
    if (!isMouseOverNode && (node.x - mouse.x) ** 2 + (node.y - mouse.y) ** 2 <= nodeRadius ** 2) {
      node.isMouseOver = true
      isMouseOverNode = true
    } else {
      node.isMouseOver = false
    }
  }
}

export const highlightNodeOnMouseClick = (nodes: NodeType[], mouse: Coords2DType, isCtrlKeyDown: boolean) => {
  let isMouseOverNode = false
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i]
    const isMouseOnNode = (node.x - mouse.x) ** 2 + (node.y - mouse.y) ** 2 <= nodeRadius ** 2
    if (!isMouseOverNode && isMouseOnNode) {
      node.isSelected = true
      isMouseOverNode = true
    } else if (!isCtrlKeyDown) {
      node.isSelected = false
    }
  }
}