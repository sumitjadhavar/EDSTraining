export default function decorate(block) {
  const text = block.querySelector('p');

  if(text) {
    const wrapper = document.createElement('div');
    wrapper.className ='scrolling-text';
    
    wrapper.append(text.cloneNode(true));
    wrapper.append(text.cloneNode(true));

    block.textContent = '';
    block.append(wrapper);
  }
}
