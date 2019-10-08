import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';


// SchematicTestRunner needs an absolute path to the collection to test.
const collectionPath = path.join(__dirname, '../collection.json');


describe('home-cockpit', () => {
  it('requires required option', () => {
    // We test that
    const runner = new SchematicTestRunner('schematics', collectionPath);
    expect(() => runner.runSchematic('home-cockpit', {}, Tree.empty())).toThrow();
  });

  it('works', () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = runner.runSchematic('home-cockpit', { name: 'str' }, Tree.empty());

    // Listing files
    expect(tree.files.sort()).toEqual(['/__name@dasherize__.md']);
  });
});
