import React from 'react';
import MenuButton from '../UI/MenuButton';
import characters from '../../data/characters';

export default function CharactersPage() {
  return (
    <div className="characters-page">
      <MenuButton />
      <h1>D&D 5e Party Characters</h1>
      <div className="characters-grid">
        {characters.map(char => (
          <div key={char.id} className="character-card">
            <h2>{char.name} <span className="char-level">Lv {char.level}</span></h2>
            <div className="char-subhead">
              {char.race} <span>•</span> {char.class} <span>•</span> {char.background}
            </div>
            <div className="char-main-info">
              <div><b>HP:</b> {char.hp} <b>AC:</b> {char.ac} <b>Speed:</b> {char.speed}ft</div>
              <div><b>Alignment:</b> {char.alignment}</div>
            </div>
            <div className="char-stats">
              <h3>Stats</h3>
              <ul>
                {Object.entries(char.stats).map(([k, v]) => (
                  <li key={k}><b>{k.toUpperCase()}</b>: {v}</li>
                ))}
              </ul>
            </div>
            <div className="char-abilities">
              <b>Skills:</b> {char.skills.join(', ')}<br/>
              <b>Abilities:</b> {char.abilities.join(', ')}<br/>
              {char.spells.length > 0 &&
                <><b>Spells:</b> {char.spells.join(', ')}<br/></>
              }
              <b>Equipment:</b> {char.equipment.join(', ')}
            </div>
            <div className="char-footer">
              <b>Passive Perception:</b> {char.passivePerception} &nbsp;
              <b>Inspiration:</b> {char.inspiration ? "Yes" : "No"}
            </div>
            {char.notes && <div className="char-notes"><i>Notes:</i> {char.notes}</div>}
          </div>
        ))}
      </div>
      <style>{`
        .characters-page {
          padding: 1rem 2rem 2rem 2rem;
        }
        .characters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .character-card {
          border: 1.5px solid #b0aa98;
          border-radius: 10px;
          background: #f8f4e8;
          padding: 1.2rem 1rem 1rem 1rem;
          box-shadow: 0 2px 6px #bbb4a333;
          min-height: 340px;
        }
        .character-card h2 {
          font-size: 1.5rem;
          margin-bottom: .3rem;
        }
        .char-level {
          font-size: 1rem; 
          font-weight: normal; 
          color: #554e2c;
        }
        .char-subhead {
          font-size: 1.01rem;
          color: #7b753d;
          margin-bottom: .6rem;
        }
        .char-main-info {
          margin-bottom: .7rem;
          font-size: 1rem;
        }
        .char-stats ul {
          display: flex;
          flex-wrap: wrap;
          list-style: none;
          gap: .8rem;
          padding: 0;
          margin: 0 0 .4rem 0;
        }
        .char-abilities {
          font-size: .97rem;
          margin-bottom: .5rem;
        }
        .char-footer {
          font-size: .93rem;
          color: #5a512c;
          margin-bottom: 0.2rem;
        }
        .char-notes {
          font-size: .88rem;
          margin-top: 0.3rem;
          color: #517d6a;
        }
      `}</style>
    </div>
  );
}
