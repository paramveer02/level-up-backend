// Auto-check if the plan is completed

export function setPlanCompleted(next) {
  // Only auto-set completed if it hasn't been manually set to true
  if (this.completed !== true) {
    const allActsComplete = this.healthActs.every(
      (act) => act.checkIns.length >= act.targetFrequency
    );
    this.completed = allActsComplete;
  }
  next();
}
