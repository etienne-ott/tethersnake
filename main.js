function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value))
}

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

var Pointer = function() {
    this.radius = 7
    this.x = 0
    this.y = 0
    this.isInsideCanvas = false
}

Pointer.prototype.mouse_move = function(event, canvas) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    this.isInsideCanvas = x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height

    if (this.isInsideCanvas) {
        this.x = x
        this.y = y
    } else {
        // clamp to nearest border
        this.x = clamp(x, 0, canvas.width)
        this.y = clamp(y, 0, canvas.height)
    }
}

Pointer.prototype.draw = function(ctx) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = "blue"
    ctx.fill()
    ctx.closePath()
}

var SwingbyGameState = function() {
    this.canvas = document.getElementById("swingby-canvas")
    this.ctx = this.canvas.getContext("2d")
    this.mouse = new Pointer()
    this.snake = new Snake()
}

SwingbyGameState.prototype.init = function() {
    document.addEventListener("mousemove", function(e) {
        this.mouse.mouse_move(e, this.canvas)
    }.bind(this))
}

SwingbyGameState.prototype.draw = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.snake.update(this.mouse)
    this.mouse.draw(this.ctx)
    this.snake.draw(this.ctx)

    requestAnimationFrame(() => this.draw())
}

var swingby_gamestate = new SwingbyGameState()
swingby_gamestate.init()
swingby_gamestate.draw()
