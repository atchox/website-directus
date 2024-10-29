export default {
	id: "reach",
	handler: (router, context) => {
		const { env } = context
		router.post("/", async (req, res) => {
			try {
				const resp = await fetch(`${env.BOT_ROUTE}/reach`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					mode: "cors",
					credentials: "include",
					referrerPolicy: "no-referrer",
					body: JSON.stringify({
						name: req.body.name,
						email: req.body.email,
						message: req.body.message,
						contacted_at: req.body.contacted_at
					})
				})
				if (resp.ok) {
					return res.status(200).end()
				} else {
					return res.status(resp.status).end()
				}
			} catch (err) {
				console.log(err)
				if (err?.cause?.code === "ECONNREFUSED") {
					res.status(502).end()
				} else if (err?.cause?.code === "ECONNABORTED") {
					res.status(504).end()
				}
				res.status(500).end()
			}
		})
	}
}
