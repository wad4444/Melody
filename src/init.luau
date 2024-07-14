local ContentProvider = game:GetService("ContentProvider")

local sound = require(script.sound)
local manager = {}

function manager.create(soundObj)
    local mappedObject = {}
    local ids = {}

    for name, soundId in soundObj do
        table.insert(ids, soundId)
        mappedObject[name] = function()
            local instance = Instance.new("Sound")
            instance.SoundId = soundId
            return sound.new(instance)
        end
    end
    
    task.spawn(function()
        local instantiated = {}
        for _, id in ids do
            local instance = Instance.new("Sound")
            instance.SoundId = id
            table.insert(instantiated, sound)
        end

        ContentProvider:PreloadAsync(instantiated)
        for _, instance in instantiated do
            instance:Destroy()
        end
    end)
    return mappedObject
end

return {
    Manager = manager,
    Sound = sound,
}