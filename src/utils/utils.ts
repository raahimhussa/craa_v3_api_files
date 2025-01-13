export class Utils {
  static getExtentionFrom(mimeType: string) {
    let extension = 'jpg';
    if (!mimeType.split(';')) {
      extension = mimeType.split('/')[2];
    } else {
      extension = mimeType.split(';')[0].split('/')[1];
    }
    return extension;
  }

  static validateEmail(email: string): boolean {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return true;
    }
    return false;
  }

  static s3Url(fileKey: string, region: string, bucketName: string): string {
    const host = `https://s3.${region}.amazonaws.com/`;
    return `${host + bucketName}/${fileKey}`;
  }

  static withDot(extention: string): string {
    return `.${extention}`;
  }

  static buildFileKey(filename: string, extention: string): string {
    return `${filename}.${extention}`;
  }
}

export function generateRandom(maxLimit = 100) {
  let rand = Math.random() * maxLimit;

  rand = Math.floor(rand); // 99

  return rand;
}

export const getFormattedTime = (seconds: number) => {
  const _second = Math.floor(seconds);
  const hours = Math.floor(_second / (60 * 60));
  const mins = Math.floor((_second - hours * 60 * 60) / 60);
  const secs = _second - hours * 60 * 60 - mins * 60;
  return `${hours.toString().padStart(2, '0')}:${mins
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const getSecondsFromFormattedTime = (time: string) => {
  const [_hours, _minutes, _seconds] = time.split(':');
  const hours = Number(_hours);
  const minutes = Number(_minutes);
  const seconds = Number(_seconds);
  if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds)) {
    return 0;
  }
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
};
