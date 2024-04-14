export type NodeType = {
  id: string
  data: string
  x: number
  y: number
  isMouseOver: boolean
  isSelected: boolean
}

export type EdgeType = {
  id: string
  source: {
    id: string
  }
  destination: {
    id: string
  }
}

export type Coords2DType = { x: number, y: number }

export type MouseClickStateType = 'default' | 'mouse-down'

// export type AnyKeyDownStateType = 'default' | 'key-down'