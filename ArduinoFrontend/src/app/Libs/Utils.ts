import { Buzzer } from './Buzzer';
import { Battery9v } from './Battery';
import { PushButton } from './PushButton';

export class Utils {
  static componentBox = {
    input: [
      ['PushButton']// Row
    ],
    power: [
      ['Battery9v'] // Row
    ],
    controllers: [],
    output: [
      ['Buzzer'], // Row
    ]
  };

  static components = {
    PushButton: {
      name: 'Push Button',
      image: './assets/images/components/PushButton.png',
      className: PushButton
    },
    Battery9v: {
      name: '9v Battery',
      image: './assets/images/components/Battery9v.png',
      className: Battery9v
    },
    Buzzer: {
      name: 'Buzzer',
      image: './assets/images/components/Buzzer.png',
      className: Buzzer
    }
  };
}
