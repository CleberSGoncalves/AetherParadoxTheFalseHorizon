extends Node

## EventBus — Barramento Global de Sinais (Godot 4.7.2)
signal score_updated(new_score: int)
signal health_updated(current: int, maximum: int)
signal player_died()
signal level_completed(level_index: int)
signal checkpoint_reached(checkpoint_id: int)
signal hud_show_message(text: String, duration: float)
signal play_sfx(sfx_name: String)
signal stars_earned(level_index: int, star_count: int)

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
