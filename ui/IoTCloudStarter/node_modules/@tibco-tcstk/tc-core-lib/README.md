<h1> Core CSDK Library</h1>
<span>The core library contains the core capabilties required for any CSDK application.<span>

<br>
<br>

<li>Tibco Cloud authentication</li>
<li>Tenant Authorization</li>
<li>Shared State Config</li>
<li>Logging</li>
<li>Error Handling</li>
<li>Caching</li>
<li>Mock Services</li>
<li>Roles</li>

<br>

The other CSDK libraries will be dependant on this library.
This library should not depend on other CSDK libraries to avoid circular dependencies.

Note: Stuff used by multiple other libraries can go here if not in their own library.

