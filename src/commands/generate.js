const fs = require('fs')
const path = require('path')

module.exports = {
    name: 'generate',
    description: 'Generates selectors file',
    run: async toolbox => {
        const {
            createHtml,
            getDefaultConfig,
            generateSelectors,
            concatExtension,
            colorString,
            parameters,
            messages,
            print: { success, info, error },
            filesystem
        } = toolbox

        let configJSON = await filesystem.read('dom.config.json', 'json')
        const domConfigNotExists = !filesystem.exists('dom.config.json')
        if (domConfigNotExists) configJSON = getDefaultConfig()

        if (parameters.first === undefined || parameters.second === undefined) {
            error(messages.error.anyParameterIsEmpty)
            info(messages.info.templateOfGenerateCommand)
            return
        }

        const htmlFile = concatExtension(parameters.first, 'html')
        const jsFile = concatExtension(parameters.second, 'js')

        const dir = path.dirname(jsFile)
        const dirNotExists = !fs.existsSync(dir)

        if (dir !== '.' && dirNotExists) 
            fs.mkdirSync(dir, { recursive: true })

        if (!filesystem.exists(htmlFile)) {
            try {
                success(await createHtml(htmlFile))
            } catch (err) {
                error(err)
            }
        }

        const generate = () =>
            generateSelectors(htmlFile, jsFile, configJSON)
                .then(successMsg => success(successMsg))
                .catch(errorMsg => error(errorMsg))

        if (!!parameters.options.watch) {
            info('Watching ' + colorString(htmlFile, 36))
            info(messages.info.rememberToRestartWatch)

            fs.watchFile(htmlFile, () => generate())
        }

        generate()
    }
}