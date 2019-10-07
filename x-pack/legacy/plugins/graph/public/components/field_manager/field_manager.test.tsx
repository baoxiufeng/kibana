/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { ReactElement } from 'react';
import { EuiColorPicker, EuiSelectable, EuiContextMenu, EuiButton } from '@elastic/eui';
import { FieldPicker } from './field_picker';
import { FieldEditor } from './field_editor';
import { GraphStore, loadFields } from '../../state_management';
import { getSuitableIcon } from '../../helpers/style_choices';
import { shallow, ShallowWrapper } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { FieldManager } from './field_manager';
import { Provider } from 'react-redux';
import { createMockGraphStore } from '../../state_management/mocks';

describe('field_manager', () => {
  let store: GraphStore;
  let instance: ShallowWrapper;
  let getInstance: () => ShallowWrapper;
  let dispatchSpy: jest.Mock;

  beforeEach(() => {
    store = createMockGraphStore({ includeSagas: false }).store;
    store.dispatch(
      loadFields([
        {
          name: 'field1',
          color: 'red',
          icon: getSuitableIcon('field1'),
          selected: true,
          type: 'string',
          hopSize: 5,
        },
        {
          name: 'field2',
          color: 'blue',
          icon: getSuitableIcon('field2'),
          selected: true,
          type: 'string',
          hopSize: 0,
          lastValidHopSize: 5,
        },
        {
          name: 'field3',
          color: 'green',
          icon: getSuitableIcon('field3'),
          selected: false,
          type: 'string',
          hopSize: 5,
        },
      ])
    );

    dispatchSpy = jest.fn(store.dispatch);
    store.dispatch = dispatchSpy;

    instance = shallow(
      <Provider store={store}>
        <FieldManager pickerOpen={true} setPickerOpen={() => {}} />
      </Provider>
    );

    getInstance = () =>
      instance
        .find(FieldManager)
        .dive()
        .dive();
  });

  it('should list editors for all selected fields', () => {
    expect(getInstance().find(FieldEditor).length).toEqual(2);
    expect(
      getInstance()
        .find(FieldEditor)
        .at(0)
        .prop('field').name
    ).toEqual('field1');
    expect(
      getInstance()
        .find(FieldEditor)
        .at(1)
        .prop('field').name
    ).toEqual('field2');
  });

  it('should select fields from picker', () => {
    expect(
      getInstance()
        .find(FieldPicker)
        .dive()
        .find(EuiSelectable)
        .prop('options')
        .map((option: { label: string }) => option.label)
    ).toEqual(['field1', 'field2', 'field3']);

    act(() => {
      getInstance()
        .find(FieldPicker)
        .dive()
        .find(EuiSelectable)
        .prop('onChange')([{ checked: 'on', label: 'field3' }]);
    });

    expect(dispatchSpy).toHaveBeenCalledWith({
      type: 'x-pack/graph/fields/SELECT_FIELD',
      payload: 'field3',
    });

    expect(getInstance().find(FieldEditor).length).toEqual(3);
  });

  it('should deselect field', () => {
    act(() => {
      getInstance()
        .find(FieldEditor)
        .at(0)
        .dive()
        .find(EuiContextMenu)
        .prop('panels')![0].items![2].onClick!({} as any);
    });

    expect(dispatchSpy).toHaveBeenCalledWith({
      type: 'x-pack/graph/fields/DESELECT_FIELD',
      payload: 'field1',
    });

    expect(getInstance().find(FieldEditor).length).toEqual(1);
  });

  it('should disable field', () => {
    const toggleItem = getInstance()
      .find(FieldEditor)
      .at(0)
      .dive()
      .find(EuiContextMenu)
      .prop('panels')![0].items![1];

    expect(toggleItem.name).toEqual('Temporarily disable');

    toggleItem.onClick!({} as any);

    expect(dispatchSpy).toHaveBeenCalledWith({
      type: 'x-pack/graph/fields/UPDATE_FIELD_PROPERTIES',
      payload: {
        fieldName: 'field1',
        fieldProperties: {
          hopSize: 0,
          lastValidHopSize: 5,
        },
      },
    });

    expect(
      getInstance()
        .find(FieldEditor)
        .at(0)
        .dive()
        .find(EuiContextMenu)
        .prop('panels')![0].items![1].name
    ).toEqual('Enable');
  });

  it('should enable field', () => {
    const toggleItem = getInstance()
      .find(FieldEditor)
      .at(1)
      .dive()
      .find(EuiContextMenu)
      .prop('panels')![0].items![1];

    expect(toggleItem.name).toEqual('Enable');

    toggleItem.onClick!({} as any);

    expect(dispatchSpy).toHaveBeenCalledWith({
      type: 'x-pack/graph/fields/UPDATE_FIELD_PROPERTIES',
      payload: {
        fieldName: 'field2',
        fieldProperties: {
          hopSize: 5,
          lastValidHopSize: 0,
        },
      },
    });

    expect(
      getInstance()
        .find(FieldEditor)
        .at(1)
        .dive()
        .find(EuiContextMenu)
        .prop('panels')![0].items![1].name
    ).toEqual('Temporarily disable');
  });

  it('should change color', () => {
    const fieldEditor = getInstance()
      .find(FieldEditor)
      .at(1)
      .dive();

    const getDisplayForm = () =>
      shallow(fieldEditor.find(EuiContextMenu).prop('panels')![1].content as ReactElement);

    act(() => {
      getDisplayForm()
        .find(EuiColorPicker)
        .prop('onChange')!('#aaa');
    });
    fieldEditor.update();
    getDisplayForm()
      .find(EuiButton)
      .prop('onClick')!({} as any);

    expect(dispatchSpy).toHaveBeenCalledWith({
      type: 'x-pack/graph/fields/UPDATE_FIELD_PROPERTIES',
      payload: {
        fieldName: 'field2',
        fieldProperties: expect.objectContaining({
          color: '#aaa',
        }),
      },
    });
  });
});