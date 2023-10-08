import User from "../models/user.js";

export async function getVolumePage(req, res) {
    try {
        if (req.user) {
          const user = await User.findById(req.user._id);
          if (!user) {
            return res.status(404).send("Benutzer nicht gefunden");
          }
          const trainingData =
            user.trainingData.length > 0 ? user.trainingData[0] : {};
    
          res.render("tools/volume", {
    
            userID: user.id,
    
            id: req.user.id,
            name: user.name,
            squatMax: user.maxSquat || "",
            benchMax: user.maxBench || "",
            deadliftMax: user.maxDeadlift || "",
            total: user.total || "",
            gender : user.gender || "",
            bodyweight : user.bodyWeight || "",
            bodyheight: user.bodyHeight || "",
            strengthLevel: user.strengthLevel || "",
            stress: user.stress || "",
            age: user.age || "",
            nutrition: user.nutrition || "",
            sleep: user.sleepQuality || "",
            doping: user.doping || "",
            regeneration: user.regenerationCapacity || "",
            trainingExperience: user.trainingExperience || "",
            recentSquatWeight: trainingData.recentSquatWeight || "",
            recentSquatReps: trainingData.recentSquatReps || "",
            recentBenchWeight: trainingData.recentBenchWeight || "",
            recentBenchReps: trainingData.recentBenchReps || "",
            recentDeadliftWeight: trainingData.recentDeadliftWeight || "",
            recentDeadliftReps: trainingData.recentDeadliftReps || "",
          });
        } else {
          res.render("tools/volume", { id: null, name: null });
        }
      } catch (err) {
        console.log(`Error while requesting the volume page ${err}`);
      }
}

export async function patchVolume(req, res) {
    try {
        const user = await User.findById(req.user._id);
    
        if (!user) {
          return res.status(404).send("Benutzer nicht gefunden");
        }
    
        patchUserData(user, req.body);
    
        await user.save();
        console.log("Daten gepatched");
    
        res.status(200).json({});
      } catch (err) {
        console.error(err);
        res.status(500).send("Fehler beim Verarbeiten der Formulardaten");
      }
}

function patchUserData(user, formData) {
    const {
      squatWeight,
      squatReps,
      squatEstMax,
      benchWeight,
      benchReps,
      benchEstMax,
      deadliftWeight,
      deadliftReps,
      deadliftEstMax,
      totalEstMax,
      gender,
      bodyweight,
      bodyheight,
      strengthLevel,
      trainingExperience,
      age,
      nutrition,
      sleep,
      stress,
      doping,
      regeneration,
      squatmev,
      squatmrv,
      benchmev,
      benchmrv,
      deadliftmev,
      deadliftmrv
    } = formData;
  
    function updateUserPropertiesIfChanged(property, value) {
      if (user[property] != value) {
        user[property] = value;
      }
    }

     // Überprüfe, ob user.trainingData vorhanden ist, andernfalls initialisiere es
  if (!user.trainingData || user.trainingData.length === 0) {
    user.trainingData = [{
      recentSquatWeight: null,
      recentSquatReps: null,
      recentBenchWeight: null,
      recentBenchReps: null,
      recentDeadliftWeight: null,
      recentDeadliftReps: null,
      minimumSetsSquat: null,
      maximumSetsSquat: null,
      minimumSetsBench: null,
      maximumSetsBench: null,
      minimumSetsDeadlift: null,
      maximumSetsDeadlift: null,
    }];
  }
  
    const existingTrainingData = user.trainingData[0];
  
    function updateTrainingDataPropertyIfChanged(newProperty, existingProperty) {
      if (newProperty !== undefined && newProperty != existingProperty) {
        return newProperty;
      } else {
        return existingProperty;
      }
    }
  
    existingTrainingData.recentSquatWeight = updateTrainingDataPropertyIfChanged(squatWeight, existingTrainingData.recentSquatWeight);
    existingTrainingData.recentSquatReps = updateTrainingDataPropertyIfChanged(squatReps, existingTrainingData.recentSquatReps);  
  
    existingTrainingData.recentBenchWeight = updateTrainingDataPropertyIfChanged(benchWeight, existingTrainingData.recentBenchWeight);  
    existingTrainingData.recentBenchReps = updateTrainingDataPropertyIfChanged(benchReps, existingTrainingData.recentBenchReps); 
  
    existingTrainingData.recentDeadliftWeight = updateTrainingDataPropertyIfChanged(deadliftWeight, existingTrainingData.recentDeadliftWeight);  
    existingTrainingData.recentDeadliftReps = updateTrainingDataPropertyIfChanged(deadliftReps, existingTrainingData.recentDeadliftReps); 
  
    existingTrainingData.minimumSetsSquat = updateTrainingDataPropertyIfChanged(squatmev, existingTrainingData.minimumSetsSquat);
    existingTrainingData.maximumSetsSquat = updateTrainingDataPropertyIfChanged(squatmrv, existingTrainingData.maximumSetsSquat);
    
    existingTrainingData.minimumSetsBench = updateTrainingDataPropertyIfChanged(benchmev, existingTrainingData.minimumSetsBench);
    existingTrainingData.maximumSetsBench = updateTrainingDataPropertyIfChanged(benchmrv, existingTrainingData.maximumSetsBench);
  
    existingTrainingData.minimumSetsDeadlift = updateTrainingDataPropertyIfChanged(deadliftmev, existingTrainingData.minimumSetsDeadlift);
    existingTrainingData.maximumSetsDeadlift = updateTrainingDataPropertyIfChanged(deadliftmrv, existingTrainingData.maximumSetsDeadlift);
  
  
    /*directly in the user object*/
  
    updateUserPropertiesIfChanged("gender", gender);
    updateUserPropertiesIfChanged("bodyWeight", bodyweight);
    updateUserPropertiesIfChanged("bodyHeight", bodyheight);
    updateUserPropertiesIfChanged("strengthLevel", strengthLevel);
    updateUserPropertiesIfChanged("trainingExperience", trainingExperience);
    updateUserPropertiesIfChanged("age", age);
  
    updateUserPropertiesIfChanged("nutrition", nutrition);
    updateUserPropertiesIfChanged("sleepQuality", sleep);
    updateUserPropertiesIfChanged("doping", doping);
    updateUserPropertiesIfChanged("regenerationCapacity", regeneration);
    updateUserPropertiesIfChanged("stress", stress);
  
    updateUserPropertiesIfChanged("maxSquat", squatEstMax);
    updateUserPropertiesIfChanged("maxBench", benchEstMax);
    updateUserPropertiesIfChanged("maxDeadlift", deadliftEstMax);
    updateUserPropertiesIfChanged("total", totalEstMax);
  
  }