extends Node
class_name SquashStretch2D

## SquashStretch2D — Deformação Elástica Spring-Damper
## Para Godot 4.x / HTML5 Web Export

@export var target_node: Node2D
@export var spring_stiffness: float = 280.0
@export var damping: float = 20.0

var scale_x: float = 1.0
var scale_y: float = 1.0
var vel_x: float = 0.0
var vel_y: float = 0.0

func _ready() -> void:
	if not target_node and get_parent() is Node2D:
		target_node = get_parent() as Node2D

func punch(sx: float, sy: float) -> void:
	scale_x = sx
	scale_y = sy

func _process(dt: float) -> void:
	if not target_node:
		return
	
	var safe_dt: float = minf(dt, 0.05)
	var ax: float = -spring_stiffness * (scale_x - 1.0) - damping * vel_x
	var ay: float = -spring_stiffness * (scale_y - 1.0) - damping * vel_y
	
	vel_x += ax * safe_dt
	vel_y += ay * safe_dt
	scale_x += vel_x * safe_dt
	scale_y += vel_y * safe_dt
	
	target_node.scale = Vector2(scale_x, scale_y)
