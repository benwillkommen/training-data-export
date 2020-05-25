module.exports = {
	"sets": [
		{
			"id": 11,
			"exercise": "id(exercise:123)",
			"number": 1,
			"date": "2020-05-02T00:00:00.000Z"
		}
	],
	"setDimensions": [
		{
			"id": 41,
			"setId": "id(set:11)",
			"dimensionId": "id(dimension:31)",
			"value": "3"
		},
		{
			"id": 42,
			"setId": "id(set:11)",
			"dimensionId": "id(dimension:32)",
			"value": "315"
		},
		{
			"id": 43,
			"setId": "id(set:11)",
			"dimensionId": "id(dimension:37)",
			"value": "true"
		}
	],
	"exercises": [
		{
			"id": 21,
			"name": "tricep pushdown",
			"defaultDimensions": [
				"id(dimnesion:31)",
				"id(dimension:32)"
			]
    },
    {
      "id": 22,
			"name": "bench press",
			"defaultDimensions": [
				"id(dimnesion:31)",
				"id(dimension:32)"
			]
    }
	],
	"dimensions": [
		{
			"id": 31,
			"name": "reps",
			"type": "number"
		},
		{
			"id": 32,
			"name": "weight (lbs)",
			"type": "number"
		},
		{
			"id": 33,
			"name": "duration",
			"type": "number"
		},
		{
			"id": 34,
			"name": "hold",
			"type": "string"
		},
		{
			"id": 35,
			"name": "peak force (lbs)",
			"type": "number"
		},
		{
			"id": 36,
			"name": "hand",
			"type": "string"
		},
		{
			"id": 37,
			"name": "paused",
			"type": "boolean"
		},
		{
			"id": 38,
			"name": "occluded",
			"type": "boolean"
		}
	]
}
