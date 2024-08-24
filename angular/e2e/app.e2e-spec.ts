import { appTemplatePage } from './app.po';

describe('app App', function() {
  let page: appTemplatePage;

  beforeEach(() => {
    page = new appTemplatePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
