
const { Configuration, OpenAIApi } = require("openai");
const keys = require("../config/keys");


const configuration = new Configuration({
    apiKey: keys.openAI,
});

const openai = new OpenAIApi(configuration);

module.exports = app => {

    app.post("/generate", async (req, res) => {
        const completion = await openai.createCompletion("text-davinci-001", {
            prompt: generatePrompt(req.body.text),
            temperature: 0.6,
        });
        if(completion && completion.data && completion.data.choices[0]) {
            res.status(200).json({ result: completion.data.choices[0].text });
        }
    })

    function generatePrompt(animal) {
        const capitalizedAnimal =
            animal[0].toUpperCase() + animal.slice(1).toLowerCase();
        return `Suggest three names for an animal that is a superhero.

Animal: Cat
Names: Captain Sharpclaw, Agent Fluffball, The Incredible Feline
Animal: Dog
Names: Ruff the Protector, Wonder Canine, Sir Barks-a-Lot
Animal: ${capitalizedAnimal}
Names:`;
    }
};
