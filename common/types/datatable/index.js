import { map } from 'lodash';
import Type from '../type';

export default new Type({
  name: 'datatable',
  from: {
    null: () => {
      return {
        type: 'datatable',
        rows: [],
        columns: [],
      };
    },
    pointseries: (context) => {
      return {
        type: 'datatable',
        rows: context.rows,
        columns: map(context.columns, (val, name) => { return { name: name, type: val.type, role: val.role }; }),
      };
    },
  },
  to: {
    render: (datatable) => {
      return {
        type: 'render',
        as: 'table',
        value: datatable,
      };
    },
  },
});
