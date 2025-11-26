const main = document.querySelector('main') as HTMLElement;
const prevBtn = document.getElementById('prevBtn') as HTMLButtonElement;
const nextBtn = document.getElementById('nextBtn') as HTMLButtonElement;
const tabsContainer = document.querySelector('.notebook-tabs') as HTMLElement;
const cards = document.querySelectorAll('.card') as NodeListOf<HTMLElement>;

// Generate Tabs
const recipes = document.querySelectorAll('.recipe-intro h2') as NodeListOf<HTMLElement>;
recipes.forEach((recipeTitle, index) => {
    const card = recipeTitle.closest('.card') as HTMLElement;
    const cardIndex = parseInt(card.style.getPropertyValue('--i'));

    // The recipe is on the BACK of this card.
    // To see the back of card N, we need to scroll to card N+1.
    const targetCardIndex = cardIndex + 1;

    const tab = document.createElement('button');
    tab.className = 'tab';
    tab.innerHTML = `<span>${recipeTitle.innerText}</span>`;
    tab.setAttribute('aria-label', `Go to ${recipeTitle.innerText}`);

    // Stagger the tabs vertically
    tab.style.top = `${(index * 24)}px`;

    tab.addEventListener('click', () => {
        if (cards[targetCardIndex]) {
            cards[targetCardIndex].scrollIntoView({ behavior: 'smooth' });
        }
    });

    tabsContainer.appendChild(tab);
});

const focusTabForScroll = (targetScrollTop: number): void => {
    const viewHeight = window.innerHeight;
    const cardIndex = Math.round(targetScrollTop / viewHeight);
    // Recipe 0 is on Card 1. So recipeIndex = cardIndex - 1.
    const recipeIndex = cardIndex - 1;
    const tabs = tabsContainer.querySelectorAll('.tab') as NodeListOf<HTMLElement>;

    if (recipeIndex >= 0 && recipeIndex < tabs.length) {
        tabs[recipeIndex].focus();
    } else {
        // If cover or back cover, blur so no tab is expanded
        if (document.activeElement && document.activeElement.classList.contains('tab')) {
            (document.activeElement as HTMLElement).blur();
        }
    }
};

let targetScrollTop: number | null = null;
let scrollTimeout: number | null = null;

const handleNavClick = (direction: number): void => {
    const viewHeight = window.innerHeight;
    const maxScroll = (cards.length - 1) * viewHeight;

    if (targetScrollTop === null) {
        // Snap current position to nearest page to start
        targetScrollTop = Math.round(main.scrollTop / viewHeight) * viewHeight;
    }

    targetScrollTop += direction * viewHeight;

    // Clamp
    targetScrollTop = Math.max(0, Math.min(targetScrollTop, maxScroll));

    main.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
    focusTabForScroll(targetScrollTop);

    // Reset target after animation is likely done so manual scrolling works later
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = window.setTimeout(() => {
        targetScrollTop = null;
    }, 800);
};

prevBtn.addEventListener('click', () => handleNavClick(-1));
nextBtn.addEventListener('click', () => handleNavClick(1));

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        handleNavClick(-1);
    } else if (e.key === 'ArrowRight') {
        handleNavClick(1);
    }
});

// Hide tabs on Front/Back Cover
type TabState = 'VISIBLE' | 'FRONT' | 'BACK';
let tabState: TabState = 'VISIBLE';

const updateTabsVisibility = (): void => {
    const scrollTop = main.scrollTop;
    const viewHeight = window.innerHeight;
    const totalCards = cards.length;

    const isFrontCover = scrollTop < viewHeight * 0.5;
    const isBackCover = scrollTop > (totalCards - 1.5) * viewHeight;

    let newState: TabState = 'VISIBLE';
    if (isFrontCover) newState = 'FRONT';
    else if (isBackCover) newState = 'BACK';

    if (newState !== tabState) {
        if (newState === 'BACK') {
            tabsContainer.classList.add('no-transition');
            tabsContainer.classList.add('hidden');
        } else if (newState === 'FRONT') {
            tabsContainer.classList.remove('no-transition');
            tabsContainer.classList.remove('delayed');
            tabsContainer.classList.add('hidden');
        } else {
            // Becoming VISIBLE
            tabsContainer.classList.remove('hidden');
            tabsContainer.classList.remove('no-transition');

            if (tabState === 'BACK') {
                tabsContainer.classList.add('delayed');
                // Remove delay after transition
                setTimeout(() => tabsContainer.classList.remove('delayed'), 1000);
            } else {
                tabsContainer.classList.remove('delayed');
            }
        }
        tabState = newState;
    }
};

main.addEventListener('scroll', updateTabsVisibility);
window.addEventListener('resize', updateTabsVisibility);
updateTabsVisibility(); // Initial check
