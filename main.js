function fill_circle(ctx, x, y, radius, fill_style) {
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fillStyle = fill_style
    ctx.fill()
    ctx.closePath()
}

function stroke_circle(ctx, x, y, radius, stroke_style) {
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.strokeStyle = stroke_style
    ctx.stroke()
    ctx.closePath()
}

var Snake = function() {
    this.speed = 360.0 // px per s
    this.mass = 0.001 // really more of force constant
    this.x = 200 // head pos y
    this.y = 30  // head pos x
    this.positions = []
    this.vx = this.speed * 0.5
    this.vy = this.speed * 0.5
    this.radius = 10
}

Snake.prototype.update = function(mouse, dt) {
    // leap-frog kick-drift-kick form for symplectic integration
    // v_half = v_i + 0.5 * a_i * dt
    // x_i+1 = x_i + v_half * dt
    // v_i+1 = v_half + 0.5 * a_i+1 * dt
    //
    // force is constant in strength, but points to pointer
    // velocity is rescaled to constant speed (does this break integration? idk)

    // a_i
    let dx = mouse.x - this.x
    let dy = mouse.y - this.y
    let l = Math.max(0.0001, Math.sqrt(dx*dx+dy*dy))
    let ax = dx / (l * this.mass)
    let ay = dy / (l * this.mass)
    // v_half
    let v_half_x = this.vx + 0.5 * ax * dt
    let v_half_y = this.vy + 0.5 * ay * dt
    l = Math.sqrt(v_half_x * v_half_x + v_half_y * v_half_y)
    let c = dt * this.speed / l
    // x_i+1
    this.x += v_half_x * c
    this.y += v_half_y * c
    // a_i+1
    dx = mouse.x - this.x
    dy = mouse.y - this.y
    l = Math.max(0.0001, Math.sqrt(dx*dx+dy*dy))
    ax = dx / (l * this.mass)
    ay = dy / (l * this.mass)
    // v_i+1
    this.vx = v_half_x + 0.5 * ax * dt
    this.vy = v_half_y + 0.5 * ay * dt
    l = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
    this.vx *= this.speed / l
    this.vy *= this.speed / l

    // record last 100 positions
    this.positions.unshift([this.x, this.y])
    if (this.positions.length > 100) {
        this.positions.pop()
    }
}

Snake.prototype.draw = function(ctx, bounds) {
    const x = Math.max(0, Math.min(ctx.canvas.width, this.x))
    const y = Math.max(0, Math.min(ctx.canvas.height, this.y))

    // draw body
    for(let i = 0; i < this.positions.length; i+=3) {
        fill_circle(ctx, this.positions[i][0], this.positions[i][1], this.radius * 0.75, "#da3535")
    }

    if (x > 0 && x < ctx.canvas.width && y > 0 && y < ctx.canvas.height) {
        // draw only head
        fill_circle(ctx, this.x, this.y, this.radius, "red")
    } else {
        // draw both head and indicator, but the former may be outside canvas
        fill_circle(ctx, this.x, this.y, this.radius, "red")
        fill_circle(ctx, x, y, this.radius * 0.65, "#ff7637")
    }
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

Pointer.prototype.draw = function(ctx, bounds) {
    const clamped = bounds.clamp(this.x, this.y)
    fill_circle(ctx, clamped[0], clamped[1], this.radius, "blue")
}

var BoundingArea = function(canvas) {
    this.radius = 150
    this.x = canvas.width / 2
    this.y = canvas.height / 2
}

BoundingArea.prototype.draw = function(ctx) {
    stroke_circle(ctx, this.x, this.y, this.radius, "black")
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
    this.mouse.draw(this.ctx, this.bounds)
    this.snake.draw(this.ctx, this.bounds)

    requestAnimationFrame(() => this.draw())
}

var swingby_gamestate = new SwingbyGameState()
swingby_gamestate.init()
