import { nanoid } from 'nanoid';

export const AwsKeys = {
  of: (file: File) => {
    const dir = 'uploads';
    const ext = file.name.split('.').pop();
    const name = `${nanoid(32)}.${ext}`;
    const key = `${dir}/${name}`;
    return key;
  },
  documents: (file: File) => {
    const dir = 'documents';
    const ext = file.name.split('.').pop();
    const name = `${nanoid(32)}.${ext}`;
    const key = `${dir}/${name}`;
    return key;
  },
};
