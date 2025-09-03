// Auto-check if the plan is completed

export function setPlanCompleted(next) {
  const allActsComplete = this.healthActs.every(
    (act) => act.checkIns.length >= act.targetFrequency
  );
  this.completed = allActsComplete;
  next();
}
