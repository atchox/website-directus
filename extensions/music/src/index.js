import { existsSync, readFileSync, writeFileSync } from "fs"

export default {
	id: "music",
	handler: (router, context) => {
		const { env } = context

		router.get("/random", async (req, res) => {
			try {
				let sa
				let music
				console.log(env.SPOTIFY_ACCESS)
				if (existsSync(env.SPOTIFY_ACCESS)) {
					sa = JSON.parse(readFileSync(env.SPOTIFY_ACCESS, "utf-8"))
					if (Date.now() >= sa.expires_at) {
						sa = await createToken(env)
					}
					music = await getRandomMusic(sa, env)
				} else {
					sa = await createToken(env)
					music = await getRandomMusic(sa, env)
				}
				return res.send(music)
			} catch (err) {
				res.status(500).end()
			}
		})
	}
}

async function createToken(env) {
	try {
		const token = env.SPOTIFY_CLIENT_ID + ":" + env.SPOTIFY_CLIENT_SECRET
		const resp = await fetch("https://accounts.spotify.com/api/token", {
			method: "POST",
			headers: {
				Authorization: "Basic " + new Buffer.from(token).toString("base64"),
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: new URLSearchParams({
				grant_type: "client_credentials"
			}).toString()
		})
		if (!resp.ok) {
			throw new Error(`Spotify token fetch failed: ${resp.status}`)
		}
		let sa = await resp.json()
		sa.created_at = Date.now()
		sa.expires_at = sa.created_at + sa.expires_in - 10 * 60
		writeFileSync(env.SPOTIFY_ACCESS, JSON.stringify(sa))
		return sa
	} catch (err) {
		console.log(err)
	}
}

async function getRandomMusic(sa, env) {
	try {
		const token = env.SPOTIFY_CLIENT_ID + ":" + env.SPOTIFY_CLIENT_SECRET
		let playlist = await fetch(`https://api.spotify.com/v1/playlists/${env.SPOTIFY_SOUL}?fields=tracks(total)`, {
			method: "GET",
			headers: {
				Authorization: "Bearer " + sa.access_token,
				"Content-Type": "application/x-www-form-urlencoded"
			}
		})
		if (!playlist.ok) {
			throw new Error(`Spotify playlist fetch failed: ${playlist.status}`)
		}
		playlist = await playlist.json()
		const total_tracks = playlist.tracks.total
		const random_offset = Math.floor(Math.random() * total_tracks)
		let tracks = await fetch(
			`https://api.spotify.com/v1/playlists/${env.SPOTIFY_SOUL}/tracks?limit=1&offset=${random_offset}&fields=items(track(id))`,
			{
				method: "GET",
				headers: {
					Authorization: "Bearer " + sa.access_token
				}
			}
		)
		if (!tracks.ok) {
			throw new Error(`Spotify track fetch failed: ${tracks.status}`)
		}
		tracks = await tracks.json()
		return tracks.items[0].track.id
	} catch (err) {
		console.log(err)
	}
}
