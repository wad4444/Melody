-- Compiled with roblox-ts v2.2.0
local TS = script:FindFirstChild("RuntimeLib") and require(script.RuntimeLib) or _G[script]
local exports = {}
for _k, _v in TS.import(script, script, "source", "sound") or {} do
	exports[_k] = _v
end
for _k, _v in TS.import(script, script, "source", "soundManager") or {} do
	exports[_k] = _v
end
return exports
