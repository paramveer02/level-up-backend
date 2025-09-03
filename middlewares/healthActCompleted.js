export function setHealthActItemCompleted(next) {
  if (this.checkIns.length >= this.targetFrequency) {
    this.isCompleted = true;
  } else {
    this.isCompleted = false;
  }
  next();
}
