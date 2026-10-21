extends Node
class_name HitStopManager

## HitStopManager — Micro-freezes táteis de impacto (40ms - 70ms)
## Para Godot 4.x / HTML5 Web Export

static var _instance: HitStopManager

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	_instance = self

static func trigger(duration_ms: float = 50.0, time_scale: float = 0.05) -> void:
	if not _instance or not _instance.is_inside_tree():
		return
	
	Engine.time_scale = time_scale
	await _instance.get_tree().create_timer(duration_ms / 1000.0, true, false, true).timeout
	Engine.time_scale = 1.0
