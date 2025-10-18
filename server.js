const express = require('express');
const app = express();

app.use(express.json());

const models = [
    { id: 1, name: 'gpt-4', type: 'language', status: 'active' },
    { id: 2, name: 'llama-3', type: 'language', status: 'active' },
    { id: 3, name: 'stable-diffusion', type: 'image', status: 'active' }
];


app.get('/api/health', (req,res) => {
    res.json({
        status: 'OK',
        timestamp: Date.now(),
        message: "Ai Model API is running"
    });
});

app.get('/api/models', (req, res) => {
    if (!models){
        return res.status(400).json({
            message: `There are no models in the backend`
        });
    };

    res.json({
        success: true,
        count: models.length,
        data: models
    });
});


app.get('/api/models/:id', (req,res) => {
    const model = models.find(m => m.id === parseInt(req.params.id));

    if (!model){
        return res.status(404).json({
            success: false,
            message: "Model not found"
        });
    }
    res.json({ success: true, data: model});
})

let predictions = [];

app.post('/api/predict', (req, res) => {
    const {model, prompt} = req.body;

    if (!model || !prompt){
        return res.status(400).json({
            success: false,
            message: "Model and prompt are required"
        });
    }

    const selectedModel = models.find(m => m.name.toLowerCase() === model.toLowerCase())

    if (!selectedModel){
        return res.status(400).json({
            success: false,
            message: `${model} not found in models! Enter the available models: ${models.map(m => m.name).join(', ')}`
        });
    }

    const prediction = {
        id:predictions.length + 1,
        model: `${selectedModel.name}`,
        prompt,
        response: `Mock response from ${model}: Processing "${prompt}"`,
        timestamp: new Date().toISOString()
    };

    predictions.push(prediction);

    res.status(201).json({
        success: true,
        data: prediction
    });
});

app.get('/api/history', (req, res) => {
    res.json({
        success: true,
        count: predictions.length,
        data: predictions
    });
});

app.get('/api/history/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = predictions.findIndex(p => p.id === id);

    if (index === -1){
        return res.status(404).json({
            success: false,
            message:  `There is no history for the given id ${id}`
        });
    };

    res.json({
        success: true,
        data: predictions[index]
    });
});

app.delete('/api/history/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = predictions.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({
            success: false,
            message: 'Predicion not found'
        });
    }

    predictions.splice(index, 1);

    res.json({
        success: true,
        message: 'Prediction deleted'
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);

})