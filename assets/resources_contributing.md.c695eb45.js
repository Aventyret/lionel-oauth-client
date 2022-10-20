import{_ as e,c as t,o as n,a}from"./app.f5eb41e9.js";const m='{"title":"Contributing","description":"","frontmatter":{},"headers":[{"level":2,"title":"Setup development environment","slug":"setup-development-environment"},{"level":2,"title":"Naming branches","slug":"naming-branches"},{"level":2,"title":"Testing","slug":"testing"},{"level":3,"title":"Unit tests","slug":"unit-tests"},{"level":3,"title":"e2e tests","slug":"e2e-tests"},{"level":2,"title":"Release","slug":"release"}],"relativePath":"resources/contributing.md"}',s={},o=a(`<h1 id="contributing" tabindex="-1">Contributing <a class="header-anchor" href="#contributing" aria-hidden="true">#</a></h1><p>How can you contribute to this project? Guidelines for PRs, suggestions, etc.</p><h2 id="setup-development-environment" tabindex="-1">Setup development environment <a class="header-anchor" href="#setup-development-environment" aria-hidden="true">#</a></h2><p>Use the Node version defined in the <code>.nvmrc</code> file in the project root. If you use NVM you can do:</p><div class="language-bash"><pre><code>nvm use
</code></pre></div><p>Install dependencies:</p><div class="language-bash"><pre><code><span class="token function">yarn</span> <span class="token operator">&amp;&amp;</span> <span class="token function">yarn</span> husky
</code></pre></div><p>Build code into <code>./dist</code> directory:</p><div class="language-bash"><pre><code><span class="token function">yarn</span> build
</code></pre></div><p>Build code with watch:</p><div class="language-bash"><pre><code><span class="token function">yarn</span> dev
</code></pre></div><h2 id="naming-branches" tabindex="-1">Naming branches <a class="header-anchor" href="#naming-branches" aria-hidden="true">#</a></h2><p>A branch should be called what it does or what it is, e.g. <em>you created a random number function so the branch could be called <code>add-random-number-function</code></em>. Keep it simple, understandable, and somewhat short.</p><h2 id="testing" tabindex="-1">Testing <a class="header-anchor" href="#testing" aria-hidden="true">#</a></h2><p><em>Everything should be tested</em>. The recommended approach is to think what you want to do and author <a href="https://en.wikipedia.org/wiki/Unit_testing" target="_blank" rel="noopener noreferrer">unit tests</a> using <a href="https://jestjs.io/" target="_blank" rel="noopener noreferrer">jest</a> that will confirm that you have successfully done it. In addition to unit testing you should also ensure that all of the <em>end-to-end (e2e) tests</em> powered by <a href="https://playwright.dev/" target="_blank" rel="noopener noreferrer">playwright</a> are still <em>green</em>, and in the instance where you have made modifications to the <em>flow</em> add or update the tests accordingly.</p><p>Run both <strong>unit</strong> and <strong>e2e</strong> tests <em>once</em>:</p><div class="language-bash"><pre><code><span class="token function">yarn</span> <span class="token builtin class-name">test</span>
</code></pre></div><h3 id="unit-tests" tabindex="-1">Unit tests <a class="header-anchor" href="#unit-tests" aria-hidden="true">#</a></h3><p>Any and all unit tests should be created in <code>/test/unit</code> and be named according to what you are testing, e.g. the <code>createStorageModule.test.ts</code> is a test for <code>createStorageModule.ts</code>.</p><p>Run <strong>unit</strong> tests:</p><div class="language-bash"><pre><code><span class="token comment"># Once</span>
<span class="token function">yarn</span> test:unit

<span class="token comment"># Watch for changes</span>
<span class="token function">yarn</span> test:unit --watch
</code></pre></div><h3 id="e2e-tests" tabindex="-1">e2e tests <a class="header-anchor" href="#e2e-tests" aria-hidden="true">#</a></h3><p>e2e tests should be created in <code>/test/e2e</code> and be named to indicate what it is supposed to test, e.g. <code>oauthPkceFlowIdentityServer.spec.ts</code>.</p><p>Run <strong>e2e</strong> tests:</p><div class="language-bash"><pre><code><span class="token function">yarn</span> test:e2e
</code></pre></div><p>Sadly <a href="https://playwright.dev/" target="_blank" rel="noopener noreferrer">playwright</a> does not currently support a watch mode like <a href="https://jestjs.io/" target="_blank" rel="noopener noreferrer">jest</a> does so when you want to check if you have broken something or made something work for the very first time you need to rerun <code>yarn test:e2e</code>.</p><h2 id="release" tabindex="-1">Release <a class="header-anchor" href="#release" aria-hidden="true">#</a></h2><p>The library is published to npm and the documentation is published to GitHub pages when a new release tag is created.</p><p>To create a new release, create a new branch and set it&#39;s upstream origin. Then run:</p><div class="language-bash"><pre><code><span class="token function">yarn</span> version patch<span class="token operator">|</span>minor<span class="token operator">|</span>major <span class="token comment"># This bumps the version in the versioned files, e.g. yarn version minor will bump version to the next minor version number</span>
<span class="token function">yarn</span> tag <span class="token comment"># This will commit the version bump and create a tag in git with the new version. The commit and the tag will be pushed to the origin remote.</span>
</code></pre></div><p>Create a pull request for the new branch into main.</p><p>After the pull request is merged, create a new release tag (with automated changlog in the description).</p>`,32),r=[o];function i(d,c,l,p,h,u){return n(),t("div",null,r)}var b=e(s,[["render",i]]);export{m as __pageData,b as default};
