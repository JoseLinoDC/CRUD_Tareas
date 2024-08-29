const express = require('express');
const app = express();
const port = 3000;

// Middleware para parsear JSON
app.use(express.json());

// Array en memoria para almacenar las tareas
let tareas = [];
let idCounter = 1;

// Ruta para crear una nueva tarea (POST /tareas)
app.post('/tareas', (req, res) => {
    const tareasNuevas = req.body;

    // Verifica que sea un array
    if (!Array.isArray(tareasNuevas)) {
        return res.status(400).json({ message: 'El body de la solicitud debe ser un array list de tareas xd' });
    }

    // Validar y agregar cada tarea
    const tareasCreadas = [];
    for (let i = 0; i < tareasNuevas.length; i++) {
        const tarea = tareasNuevas[i];

        if (!tarea.titulo || !tarea.descripcion) {
            return res.status(400).json({ message: `La tarea en la posición ${i} no tiene un título o descripción válidos` });
        }

        const nuevaTarea = {
            id: idCounter++,
            titulo: tarea.titulo,
            descripcion: tarea.descripcion,
            completado: tarea.completado || false,
            fechaCreacion: new Date()
        };
        tareas.push(nuevaTarea);
        tareasCreadas.push(nuevaTarea);
    }

    res.status(201).json(tareasCreadas);
});

// Ruta para leer todas las tareas (GET /tareas)
app.get('/tareas', (req, res) => {
    res.json(tareas);
});

// Ruta para leer una tarea específica por su ID (GET /tareas/:id)
app.get('/tareas/:id', (req, res) => {
    const tarea = tareas.find(t => t.id === parseInt(req.params.id));

    if (!tarea) {
        return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    res.json(tarea);
});

// Ruta para actualizar una tarea existente (PUT /tareas/:id)
app.put('/tareas/:id', (req, res) => {
    const tarea = tareas.find(t => t.id === parseInt(req.params.id));

    if (!tarea) {
        return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    const { titulo, descripcion, completado } = req.body;

    if (titulo !== undefined) tarea.titulo = titulo;
    if (descripcion !== undefined) tarea.descripcion = descripcion;
    if (completado !== undefined) tarea.completado = completado;

    res.json(tarea);
});

// Ruta para eliminar una tarea por su ID (DELETE /tareas/:id)
app.delete('/tareas/:id', (req, res) => {
    const tareaIndex = tareas.findIndex(t => t.id === parseInt(req.params.id));

    if (tareaIndex === -1) {
        return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    tareas.splice(tareaIndex, 1);
    res.status(204).send();
});


// Ruta para calcular estadísticas sobre las tareas
app.get('/estadisticas', (req, res) => {
    const totalTareas = tareas.length;

    // Encontrar la tarea más reciente
    const tareaMasReciente = tareas.reduce((reciente, tarea) => {
        return !reciente || new Date(tarea.fechaCreacion) > new Date(reciente.fechaCreacion) ? tarea : reciente;
    }, null);

    // Encontrar la tarea más antigua
    const tareaMasAntigua = tareas.reduce((antigua, tarea) => {
        return !antigua || new Date(tarea.fechaCreacion) < new Date(antigua.fechaCreacion) ? tarea : antigua;
    }, null);

    // Calcular la cantidad de tareas completadas
    const cantidadCompletadas = tareas.filter(t => t.completado).length;

    // Calcular la cantidad de tareas pendientes
    const cantidadPendientes = totalTareas - cantidadCompletadas;

    res.json({
        totalTareas,
        tareaMasReciente: tareaMasReciente ? tareaMasReciente.titulo : null,
        tareaMasAntigua: tareaMasAntigua ? tareaMasAntigua.titulo : null,
        cantidadCompletadas,
        cantidadPendientes
    });
});


// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
