import fs from 'fs';

const html = fs.readFileSync( 'index.html', 'utf-8' )

const scriptOutput = html.match(/<script\ssrc="\/.+"><\/script>/g).map(file => {
	const src = file.match(/<script\ssrc="\/(.+)"><\/script>/)[1]
	return fs.readFileSync(`./${src}`, 'utf-8').replace(/\n/g, '\n\t\t')
})

const output = html.replace(
	/.*<script\ssrc="\/(.+)"><\/script>.*\n/g,
	''
).replace(
	/<link.*href="\/(.+\.css)".*>/g,
	(tag, href) => {
		const style = fs.readFileSync(`./${href}`, 'utf-8')

		return `<style>\n\t\t${style.replace(/\n/g, '\n\t\t')}\n\t</style>`
	}
).replace('<!--OUTPUT-->', `<script type="module">\n\t\t${scriptOutput.join('\n')}\n\t</script>`)

fs.writeFileSync('output.html', output, 'utf-8')
