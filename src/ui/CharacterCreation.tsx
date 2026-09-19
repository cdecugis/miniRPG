import { useState } from 'react';
import type { FormEvent } from 'react';

interface CharacterCreationProps {
  onCreate: (name: string) => void;
}

export function CharacterCreation({ onCreate }: CharacterCreationProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      onCreate(name);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to create character.');
    }
  }

  return (
    <section className="intro panel" aria-labelledby="creation-title">
      <p className="eyebrow">The first page</p>
      <h1 id="creation-title">Character Creation</h1>
      <p className="lede">Every story begins with a name. What is yours?</p>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="character-name">Character name</label>
        <input
          id="character-name"
          name="characterName"
          value={name}
          onChange={(event) => { setName(event.target.value); setError(''); }}
          autoComplete="off"
          autoFocus
          required
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'name-error' : undefined}
        />
        {error && <p id="name-error" className="error" role="alert">{error}</p>}
        <button type="submit">Create character <span aria-hidden="true">→</span></button>
      </form>
    </section>
  );
}
