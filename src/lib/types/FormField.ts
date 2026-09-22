export type FormFieldConfig<T> = {
  [K in keyof T]: T[K] extends boolean
    ? {
        name: K;
        type: 'checkbox';
        label: string;
      }
    : {
        name: K;
        type: 'text' | 'email' | 'password';
        label?: string;
        placeholder?: string;
        autocomplete?: string;
        hint?: string;
        showStrength?: boolean;
      };
}[keyof T];
