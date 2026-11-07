var Snake = function() {
    this.speed = 6.0
    this.mass = 3.0
    this.x = 200
    this.y = 30
    this.vx = this.speed * 0.5
    this.vy = this.speed * 0.5
    this.radius = 10
}

Snake.prototype.update = function(mouse) {
    let dx = mouse.x - this.x
    let dy = mouse.y - this.y
    let l = Math.sqrt(dx*dx+dy*dy)
    this.vx += dx / (l * this.mass)
    this.vy += dy / (l * this.mass)
    l = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
    this.vx = this.speed * this.vx / l
    this.vy = this.speed * this.vy / l
    this.x += this.vx
    this.y += this.vy
}

Snake.prototype.draw = function(ctx) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = "red"
    ctx.fill()
    ctx.closePath()
}

var Pointer = function(canvas) {
    this.radius = 7
    this.x = canvas.width * 0.5
    this.y = canvas.height * 0.5
}

Pointer.prototype.mouse_move = function(event, canvas, bounds) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const clamped = bounds.clamp(x, y)
    this.x = clamped[0]
    this.y = clamped[1]
}

Pointer.prototype.draw = function(ctx) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = "blue"
    ctx.fill()
    ctx.closePath()
}

var BoundingArea = function(canvas) {
    this.radius = 150
    this.x = canvas.width / 2
    this.y = canvas.height / 2
}

BoundingArea.prototype.draw = function(ctx) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.strokeStyle = "black"
    ctx.stroke()
    ctx.closePath()
}

BoundingArea.prototype.clamp = function(x, y) {
    let vec = [x - this.x, y - this.y]
    let l = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1])
    if (l > this.radius) {
        return [this.x + vec[0] * this.radius / l, this.y + vec[1] * this.radius / l]
    }
    return [x, y]
}

var SwingbyGameState = function() {
    this.canvas = document.getElementById("swingby-canvas")
    this.ctx = this.canvas.getContext("2d")
    this.mouse = new Pointer(this.canvas)
    this.snake = new Snake()
    this.bounds = new BoundingArea(this.canvas)
    this.last_ts = performance.now()
}

SwingbyGameState.prototype.init = function() {
    document.addEventListener("mousemove", function(e) {
        this.mouse.mouse_move(e, this.canvas, this.bounds)
    }.bind(this))

    // start update and draw loops separately
    swingby_gamestate.update(this.last_ts)
    swingby_gamestate.draw()
}

SwingbyGameState.prototype.update = function(new_ts) {
    let dt = (new_ts - this.last_ts) * 0.001
    this.snake.update(this.mouse, dt)
    this.last_ts = new_ts
    requestAnimationFrame((ts) => this.update(ts))
}

SwingbyGameState.prototype.draw = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.bounds.draw(this.ctx)
    this.mouse.draw(this.ctx)
    this.snake.draw(this.ctx)

    requestAnimationFrame(() => this.draw())
}

var swingby_gamestate = new SwingbyGameState()
swingby_gamestate.init()
