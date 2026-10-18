export interface PasswordCheck {
    key: string;
    label: string;
    passed: boolean;
}

export type Rule = (value: unknown) => true | string;
