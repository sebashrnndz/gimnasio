document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('exercise-form');
    const exercisesList = document.getElementById('exercises-list');
    const tabButtons = document.querySelectorAll('.tab-button');
    const themeToggle = document.getElementById('theme-toggle');
    let exercises = JSON.parse(localStorage.getItem('exercises')) || [];

    // Cargar tema
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        themeToggle.checked = true;
    }

    form.addEventListener('submit', addExercise);
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            showExercises(this.dataset.day);
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
    themeToggle.addEventListener('change', toggleDarkMode);

    function addExercise(e) {
        e.preventDefault();
        const name = document.getElementById('exercise-name').value.trim();
        const day = document.getElementById('day-select').value;
        const weight = document.getElementById('weight').value;
        const sets = document.getElementById('sets').value;
        const reps = document.getElementById('reps').value;
        const complexity = document.querySelector('input[name="complexity"]:checked').value;

        const currentDate = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });

        const existingExerciseIndex = exercises.findIndex(ex => ex.name.toLowerCase() === name.toLowerCase() && ex.day === day);

        if (existingExerciseIndex !== -1) {
            exercises[existingExerciseIndex].entries.push({ weight, sets, reps, complexity, date: currentDate });
        } else {
            exercises.push({
                name,
                day,
                entries: [{ weight, sets, reps, complexity, date: currentDate }]
            });
        }

        localStorage.setItem('exercises', JSON.stringify(exercises));
        form.reset();
        showExercises(day);
    }

    function showExercises(day) {
        const filteredExercises = exercises.filter(ex => ex.day === day);
        exercisesList.innerHTML = '';

        if (filteredExercises.length === 0) {
            exercisesList.innerHTML = `
                <div class="exercise-item">
                    <p style="text-align: center; color: var(--tab-inactive);">No hay ejercicios para este día</p>
                </div>
            `;
        } else {
            filteredExercises.forEach(exercise => {
                const exerciseElement = document.createElement('div');
                exerciseElement.classList.add('exercise-item');

                let entriesHTML = '';
                exercise.entries.forEach((entry, index) => {
                    entriesHTML += `
                        <div class="entry">
                            <p>Fecha: ${entry.date}</p>
                            <p>Peso: ${entry.weight} kg</p>
                            <p>Series: ${entry.sets}</p>
                            <p>Repeticiones: ${entry.reps}</p>
                            <p>Complejidad: ${entry.complexity}</p>
                            <button class="delete-button" onclick="deleteEntry('${exercise.name}', '${day}', ${index})">
                                Borrar
                            </button>
                        </div>
                    `;
                });

                exerciseElement.innerHTML = `
                    <h3>${exercise.name}</h3>
                    ${entriesHTML}
                    <button class="delete-button" onclick="deleteExercise('${exercise.name}', '${day}')">
                        Borrar Ejercicio
                    </button>
                `;

                exercisesList.appendChild(exerciseElement);
            });
        }

        tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.day === day);
        });
    }

    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    }

    // Mostrar ejercicios del lunes por defecto

    // Funciones globales para los botones onclick
    window.deleteEntry = function(exerciseName, day, entryIndex) {
        exercises = exercises.map(exercise => {
            if (exercise.name === exerciseName && exercise.day === day) {
                exercise.entries.splice(entryIndex, 1);
            }
            return exercise;
        }).filter(exercise => exercise.entries.length > 0);

        localStorage.setItem('exercises', JSON.stringify(exercises));
        showExercises(day);
    };

    window.deleteExercise = function(exerciseName, day) {
        exercises = exercises.filter(exercise => !(exercise.name === exerciseName && exercise.day === day));
        localStorage.setItem('exercises', JSON.stringify(exercises));
        showExercises(day);
    };

    // Establecer el día actual como activo al cargar la página
    const currentDay = new Date().toLocaleString('es-ES', {weekday: 'long'});
    const defaultDay = currentDay.charAt(0).toUpperCase() + currentDay.slice(1);
    showExercises(defaultDay);
    document.querySelector(`[data-day="${defaultDay}"]`).classList.add('active');
});

