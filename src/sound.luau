local class = {}
class.__index = class
class.playingSounds = {}

function updateAll()
	for _, v in class.playingSounds do
		v:_update()
	end
end

function class.new(instance)
	local self = setmetatable({}, {
		__index = function(myself, index)
			if class[index] then
				return class[index]
			end
			if index == "Volume" then
				return myself._desiredVolume
			end
			if rawget(myself, index) ~= nil then
				return rawget(myself, index)
			end
			local success, _ = pcall(function()
				local _ = instance[index]
			end)

			assert(success, `{index} is not a valid instance method/property.`)
			local instanceProp = instance[index]
			if typeof(instanceProp) == "function" then
				instanceProp = function(_, ...)
					instance[index](instance, ...)
				end
			end

			return instanceProp
		end,
		__newindex = function(myself, index, value)
			if rawget(myself, index) then
				rawset(myself, index, value)
				return
			end
			if index == "Volume" then
				myself:_volumeTo(value)
				return
			end
			local success, _ = pcall(function()
				instance[index] = value
			end)

			assert(success, `Cannot set {index} of Sound Instance to {value}`)
			return nil
		end,
	})
	return self:constructor(instance) or self
end

function class:Play(muteOthers)
	if muteOthers ~= nil then
		rawset(self, "MuteOthers", muteOthers)
	end
	self.Instance:Play()
end

function class:_update()
	for _, sound in class.playingSounds do
		if sound.Priority > self.Priority and sound.MuteOthers then
			self.Instance.Volume = 0
		else
			self.Instance.Volume = self._desiredVolume
		end
	end
end

function class:constructor(instance)
	rawset(self, "_desiredVolume", 0.5)
	rawset(self, "Instance", instance)
	rawset(self, "Priority", 1)
	rawset(self, "MuteOthers", false)

	self:connectEvents()
end

function class:_volumeTo(newVolume)
	self._desiredVolume = newVolume
	self:_update()
end

function class:connectEvents()
	local continue = function()
		table.insert(class.playingSounds, self)
		updateAll()
	end
	local stop = function()
		local index = table.find(class.playingSounds, self)
		if not index then
			return
		end
		table.remove(class.playingSounds, index)
	end

	self.Instance.Played:Connect(continue)
	self.Instance.Resumed:Connect(continue)
	self.Instance.Paused:Connect(stop)
	self.Instance.Ended:Connect(stop)
	self.Instance.Stopped:Connect(stop)
end

return class
