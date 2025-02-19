import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  public static formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hour = ('0' + date.getHours()).slice(-2);
    const minute = ('0' + date.getMinutes()).slice(-2);
    const second = ('0' + date.getSeconds()).slice(-2);

    return `${year}${month}${day}T${hour}${minute}${second}`;
  }

  public static parseDate(date: string): Date {
    const year = parseInt(date.slice(0, 4));
    const month = parseInt(date.slice(4, 6)) - 1;
    const day = parseInt(date.slice(6, 8));
    const hour = parseInt(date.slice(9, 11));
    const minute = parseInt(date.slice(11, 13));
    const second = parseInt(date.slice(13, 15));
    return new Date(year, month, day, hour, minute, second);
  }

  public static formatTime(dateTime: string): string {
    const formattedDateTime = `${dateTime.slice(0, 4)}-${dateTime.slice(4, 6)}-${dateTime.slice(6, 8)}T${dateTime.slice(9, 11)}:${dateTime.slice(11, 13)}:${dateTime.slice(13, 15)}`;
    const date = new Date(formattedDateTime);
    // return date.toLocaleTimeString([], { hourCycle: 'h23', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return date.toLocaleTimeString([], { hourCycle: 'h23', hour: '2-digit', minute: '2-digit' });
  }

  public static formatDuration(duration: number): string {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;

    const formattedHours = hours > 0 ? `${hours}h` : '';
    const formattedMinutes = (minutes > 0 || (hours > 0 && seconds > 0)) ? (hours > 0 ? String(minutes).padStart(2, '0') : minutes) + 'min' : '';

    return `${formattedHours}${formattedMinutes}`.trim();
  }

  public static durationToMinutes(duration: number): number {
    return Math.floor(duration / 60);
  }

}
