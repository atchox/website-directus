export default {
	id: "music",
	handler: (router, context) => {
		const { services, getSchema } = context
		const { ItemsService } = services

		router.get("/random", async (req, res) => {
			try {
				const musicServices = new ItemsService("music", {
					schema: await getSchema(),
					accountability: req.accountability
				})
				const meta = await musicServices.readByQuery({
					aggregate: {
						count: ["tid"]
					}
				})
				const count = meta[0].count.tid
				const music = await musicServices.readByQuery({
					limit: 1,
					offset: Math.floor(Math.random() * count)
				})
				res.json(music[0]).end()
			} catch (err) {
				console.log(err)
				res.status(500).end()
			}
		})
	}
}
