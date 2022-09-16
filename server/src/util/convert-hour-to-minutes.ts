export function ConvertHourToMinutes(hourString: string) {
  const [hours, minutes] = hourString.split(':').map(Number)

  const totalInMinutes = (hours * 60) + minutes;
  return totalInMinutes;
}