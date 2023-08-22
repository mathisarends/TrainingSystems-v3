// Beispiel: Passwort setzen und neuen Benutzer erstellen
async function createUser(name, email, password, age) {
    try {
      // Das Passwort wird hier als 'password' bezeichnet
      const user = new User({
        name: name,
        email: email,
        password: password, // Passwort setzen
        age: age
      });
  
      // Den neuen Benutzer speichern
      await user.save();
      console.log('Benutzer wurde erfolgreich erstellt.');
    } catch (error) {
      console.error('Fehler beim Erstellen des Benutzers:', error);
    }
  }
  
  // Beispiel: Erstellen eines Trainingsplans mit mehreren Übungen
  async function createTrainingPlanWithTrainingData() {
      try {
        const exercise1 = {
          exerciseName: 'Liegestütze',
          sets: [{ weightMoved: 10 }, { weightMoved: 12 }, { weightMoved: 11 }]
        };
    
        const exercise2 = {
          exerciseName: 'Kniebeugen',
          sets: [{ weightMoved: 20 }, { weightMoved: 22 }]
        };
    
        const trainingPlan = new TrainingPlan({
          name: 'Ganzkörpertraining',
          exercises: [exercise1, exercise2],
          isDefault: true //dies ist ein standart-plan auf den alle user zugriff 
        });
    
        await trainingPlan.save();
        console.log('Trainingsplan mit Trainingsdaten wurde erfolgreich erstellt.');
      } catch (error) {
        console.error('Fehler beim Erstellen des Trainingsplans:', error);
      }
    }
  
  
    // requires TrainingPlanModel - TODO: besser auslagern in eine seperate datei
    async function getNumberOfSetsForExercise(exerciseName) {
      try {
        const trainingPlan = await TrainingPlan.findOne({ 'exercises.exerciseName': exerciseName });
        if (!trainingPlan) {
          console.log('Übung nicht gefunden.');
          return;
        }
    
        const exercise = trainingPlan.exercises.find(ex => ex.exerciseName === exerciseName);
        const numberOfSets = exercise.sets.length;
        console.log(`Anzahl der Sets für ${exerciseName}: ${numberOfSets}`);
      } catch (error) {
        console.error('Fehler beim Abrufen der Daten:', error);
      }
    }
  
    async function getAverageWeightMovedForExercise(exerciseName) {
      try {
        const trainingPlan = await TrainingPlan.findOne({ 'exercises.exerciseName': exerciseName });
        if (!trainingPlan) {
          console.log('Übung nicht gefunden.');
          return;
        }
    
        const exercise = trainingPlan.exercises.find(ex => ex.exerciseName === exerciseName);
        const totalWeightMoved = exercise.sets.reduce((sum, set) => sum + set.weightMoved, 0);
        const averageWeightMoved = totalWeightMoved / exercise.sets.length;
        console.log(`Durchschnittlich bewegtes Gewicht für ${exerciseName}: ${averageWeightMoved.toFixed(2)}`);
      } catch (error) {
        console.error('Fehler beim Abrufen der Daten:', error);
      }
    }