import { CanvasTexture as CT } from 'three'

const defaultConfig = {
  width: 256,
  height: 256
}

export default function CanvasTexture(params) {
  const config = { ...defaultConfig, ...params }

  const canvas = document.createElement('canvas')
  canvas.width = config.width
  canvas.height = config.height

  const ctx = canvas.getContext('2d')

  const texture = new CT(ctx.canvas)

  return { canvas, ctx, texture }
}
