extends Camera2D
class_name JuiceCamera2D

## JuiceCamera2D — Câmera 2D com Screen Shake Exponencial (Trauma²)
## Para Godot 4.x / HTML5 Web Export

@export var decay: float = 1.6
@export var max_offset: Vector2 = Vector2(24, 24)
@export var max_roll: float = 0.08
@export var target_node: Node2D

var trauma: float = 0.0
var trauma_power: int = 2

func _ready() -> void:
	randomize()

func add_trauma(amount: float) -> void:
	trauma = clampf(trauma + amount, 0.0, 1.0)

func _process(dt: float) -> void:
	if target_node and is_instance_valid(target_node):
		global_position = global_position.lerp(target_node.global_position, dt * 8.0)
	
	if trauma > 0.0:
		trauma = maxf(0.0, trauma - decay * dt)
		_shake()
	else:
		offset = Vector2.ZERO
		rotation = 0.0

func _shake() -> void:
	var amount: float = pow(trauma, trauma_power)
	rotation = max_roll * amount * randf_range(-1.0, 1.0)
	offset.x = max_offset.x * amount * randf_range(-1.0, 1.0)
	offset.y = max_offset.y * amount * randf_range(-1.0, 1.0)
