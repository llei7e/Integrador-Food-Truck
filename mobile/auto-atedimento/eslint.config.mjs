import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactNative from 'eslint-plugin-react-native';

export default tseslint.config(
  { ignores: ['node_modules/**', 'dist/**', '.expo/**', '__tests__/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-native': reactNative,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: tseslint.parser,
      globals: {
        // Globals comuns do React Native (fix: valores explícitos para v9)
        Alert: 'readonly',
        Dimensions: 'readonly',
        Platform: 'readonly',
        PixelRatio: 'readonly',
        UIManager: 'readonly',
        __DEV__: 'readonly',
        jest: 'readonly',  // Para testes
        // Adicione mais se necessário (ex.: expo-location: 'readonly')
      },
    },
    rules: {
      // Regras customizadas (warnings para não bloquear CI)
      'react-native/no-unused-styles': 'warn',
      'react-native/no-inline-styles': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      'react-hooks/rules-of-hooks': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react/react-in-jsx-scope': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
  }
);