# Changelog

## [2.10.0](https://www.github.com/dxos/sdk/compare/v2.9.0...v2.10.0) (2021-02-12)


### ⚠ BREAKING CHANGES

* Reverted breaking changes from the migration.
* ClientConfig expects registry, not wns property
* Party import feature expects models with dxn:// registry
* Various env variables changed prefix to DX
* Bump major.
* Publish to NPM

### Features

* Add initialization loader ([08f2f8b](https://www.github.com/dxos/sdk/commit/08f2f8b3782efcc6b7612d08d2d0ae514a494909))
* Add pad registration to AppKitProvider ([4b790f1](https://www.github.com/dxos/sdk/commit/4b790f11061723657a38a80aba3b2465f3a06c3b))
* Bring back generic pad settings ([#231](https://www.github.com/dxos/sdk/issues/231)) ([20f04d7](https://www.github.com/dxos/sdk/commit/20f04d7abb4821990464972d8529cc35f588efee))
* Bump major. ([749b90a](https://www.github.com/dxos/sdk/commit/749b90a081240dcf6b9f91feb87afcad017dd106))
* Bump minor. ([3a5780b](https://www.github.com/dxos/sdk/commit/3a5780be42a4eb46ad3cd4af0c9d8c241f0b552a))
* Control logging output in devtools ([#490](https://www.github.com/dxos/sdk/issues/490)) ([5d8ca64](https://www.github.com/dxos/sdk/commit/5d8ca643d84ced28cbd5af4f239c17d864dab0e2))
* Initial release-please. ([57d0de0](https://www.github.com/dxos/sdk/commit/57d0de0fe5f4657a80c349ce79e9c061c639e5b4))
* Party snapshots ([#275](https://www.github.com/dxos/sdk/issues/275)) ([6206456](https://www.github.com/dxos/sdk/commit/6206456dac7587e15104af45324492449571c371))
* Publish to NPM ([5cea57a](https://www.github.com/dxos/sdk/commit/5cea57a66f8bba31806bfda669412b1f5874a925))
* react-client refactoring & stability improvements ([#227](https://www.github.com/dxos/sdk/issues/227)) ([98fefbb](https://www.github.com/dxos/sdk/commit/98fefbbc4053ed111dfbc05136a44d8bd861ecf5))
* Rename AppKitContextProvider -> AppKitProvider ([8fad7d5](https://www.github.com/dxos/sdk/commit/8fad7d55a74ccfdac8e0ee088f206eb5e7bf4614))
* Required changes for implementing new Echo in Teamwork ([#210](https://www.github.com/dxos/sdk/issues/210)) ([870080c](https://www.github.com/dxos/sdk/commit/870080ce9a9029a68a73cd5b25d822716ec3e449))
* Restore party item restore functionality ([#253](https://www.github.com/dxos/sdk/issues/253)) ([8384123](https://www.github.com/dxos/sdk/commit/83841231da666d76a1a868a4fd4b39c1a9cc08e6))
* Revert WNS migration ([#512](https://www.github.com/dxos/sdk/issues/512)) ([7875d8e](https://www.github.com/dxos/sdk/commit/7875d8eacc173369b8155bd4011c16e0395fe1f5))
* Rewrite client config ([#258](https://www.github.com/dxos/sdk/issues/258)) ([adc89af](https://www.github.com/dxos/sdk/commit/adc89af4ac1296bb03b64472e38a34bfa7447ed1))
* Trigger publish ([2ce32d7](https://www.github.com/dxos/sdk/commit/2ce32d7f4eecdfbb04f2def22fc0557c72402e2d))
* WNS migration ([b36b49b](https://www.github.com/dxos/sdk/commit/b36b49b5f26249130475acf8496fea53e81f83f4))
* WNS migration ([#507](https://www.github.com/dxos/sdk/issues/507)) ([264e923](https://www.github.com/dxos/sdk/commit/264e9232fc29c159424bfad2cc0a18a7d3a2a881))


### Bug Fixes

* Accept textual party contents for import ([#487](https://www.github.com/dxos/sdk/issues/487)) ([fd79af1](https://www.github.com/dxos/sdk/commit/fd79af140f867bd5860be830b2afe1b9216b9476))
* Add 'persistent' storage type that selects the default driver for the platform ([c499c20](https://www.github.com/dxos/sdk/commit/c499c20f47b59c59b656dd94ff48f27e3ebef888))
* Add a function to pre-initialize client ([#292](https://www.github.com/dxos/sdk/issues/292)) ([00536aa](https://www.github.com/dxos/sdk/commit/00536aaf4b54cd1463c60b7cfd2d79fdda029260))
* Add a step to build storybook ([#333](https://www.github.com/dxos/sdk/issues/333)) ([82966b8](https://www.github.com/dxos/sdk/commit/82966b89c3e538db6b9805147df95775625f6883))
* Add first version of device invite ([#372](https://www.github.com/dxos/sdk/issues/372)) ([03702a6](https://www.github.com/dxos/sdk/commit/03702a6bc2421ff11010be956425379e4f2c6b82))
* Add lockfile linting. ([07e7190](https://www.github.com/dxos/sdk/commit/07e719005343057c7547f24f588a565294bd86d6))
* add missing fileds for bf status. ([#434](https://www.github.com/dxos/sdk/issues/434)) ([4471d76](https://www.github.com/dxos/sdk/commit/4471d76a7dc54a4fccd1aa235c646306c7d9ec58))
* Add more logging. ([#347](https://www.github.com/dxos/sdk/issues/347)) ([7ba10c2](https://www.github.com/dxos/sdk/commit/7ba10c2ba9baee36b60d18657ef125c221a1c8e4))
* Add pending invitations names ([#465](https://www.github.com/dxos/sdk/issues/465)) ([86fcda5](https://www.github.com/dxos/sdk/commit/86fcda5b0c54bac648238f2e0c33e2a340a303b7))
* Add Sentry observability ([#455](https://www.github.com/dxos/sdk/issues/455)) ([dd71f78](https://www.github.com/dxos/sdk/commit/dd71f78668f03f80711f85d6709fcfcab8bdb893))
* Allow the user to not specify WNS ([#273](https://www.github.com/dxos/sdk/issues/273)) ([5e7ce5c](https://www.github.com/dxos/sdk/commit/5e7ce5c60c4f3a31f149ee28074851b2432aea2f))
* automatically close redeem dialog and restore state to initial ([#255](https://www.github.com/dxos/sdk/issues/255)) ([955cb02](https://www.github.com/dxos/sdk/commit/955cb0292023330998df6d70f1a95dd1f671bc82))
* Bot factory version. ([#357](https://www.github.com/dxos/sdk/issues/357)) ([a88939b](https://www.github.com/dxos/sdk/commit/a88939b5272e380cfff8bde46d0229ed8929c429))
* bot to emit events on party join. ([#222](https://www.github.com/dxos/sdk/issues/222)) ([bf890c6](https://www.github.com/dxos/sdk/commit/bf890c656eda1ddc64d1c72e5f715b02e279dbd0))
* botkit regressions fix & improvements. ([#429](https://www.github.com/dxos/sdk/issues/429)) ([ca2411e](https://www.github.com/dxos/sdk/commit/ca2411edb81cd68e9efc54a8625e831ce82f81f9))
* Bring back bot invites ([#310](https://www.github.com/dxos/sdk/issues/310)) ([0a1bd78](https://www.github.com/dxos/sdk/commit/0a1bd789a4598a1a8daf1029015c65979a8aaf87))
* Bump patch ([c085e1c](https://www.github.com/dxos/sdk/commit/c085e1c2be45eb4b9403476d3c329ab05a7ce9a6))
* Convert react-appkit to TS ([#453](https://www.github.com/dxos/sdk/issues/453)) ([f95ebac](https://www.github.com/dxos/sdk/commit/f95ebac667bd1d9c36b6659751dc9084f69d266e))
* Create parties settings dialog ([#463](https://www.github.com/dxos/sdk/issues/463)) ([0febc89](https://www.github.com/dxos/sdk/commit/0febc89bc9eba96e66c9a7890eceb98f56f74ef5))
* Default party display name ([#247](https://www.github.com/dxos/sdk/issues/247)) ([9a06de3](https://www.github.com/dxos/sdk/commit/9a06de3aebfd305010e8a0e7c0a166f48e6b38e2))
* Deprecate check for errors ([0b72f1a](https://www.github.com/dxos/sdk/commit/0b72f1a8bb88e83bfbe30c2d1c04fe3cd0e81da3))
* Device invitation flow uniform with regular invitations ([#378](https://www.github.com/dxos/sdk/issues/378)) ([411c9ff](https://www.github.com/dxos/sdk/commit/411c9fff60c4ebc2de773930053873eb328ad70e))
* Dialogs icon and title ([#468](https://www.github.com/dxos/sdk/issues/468)) ([03c9c79](https://www.github.com/dxos/sdk/commit/03c9c7982df0cf9ace8debe430751d0609d55796))
* Disable alpha publishing until correct version. ([af02376](https://www.github.com/dxos/sdk/commit/af02376b6555eeeeeda4f7116ea476f6674562da))
* Disable broken members link. ([#271](https://www.github.com/dxos/sdk/issues/271)) ([46715b6](https://www.github.com/dxos/sdk/commit/46715b668fe1beec323b76bb0cff027b2130118b))
* Disable broken party settings ([#246](https://www.github.com/dxos/sdk/issues/246)) ([e374198](https://www.github.com/dxos/sdk/commit/e374198d4d8f8fedb94dc829c5d628a4310de18f))
* Enable publishing ([e81bf6e](https://www.github.com/dxos/sdk/commit/e81bf6e21b639b70b37822b2539f6193f5d68222))
* Exact versions for dxos packages ([#438](https://www.github.com/dxos/sdk/issues/438)) ([ae1bb49](https://www.github.com/dxos/sdk/commit/ae1bb498fa2bbac5c420626329f2a972d70a478b))
* Export devtools context interface ([#478](https://www.github.com/dxos/sdk/issues/478)) ([da76650](https://www.github.com/dxos/sdk/commit/da766509b120a1c38c28939de700fed092ce946d))
* Export registries ([#363](https://www.github.com/dxos/sdk/issues/363)) ([9f3c263](https://www.github.com/dxos/sdk/commit/9f3c263708df0179a7c73accc19104772b7eb1ea))
* First version of party activation ([#390](https://www.github.com/dxos/sdk/issues/390)) ([474fc58](https://www.github.com/dxos/sdk/commit/474fc58137b129a69f2edd6a4e1e6a3b5509f3bd)), closes [#387](https://www.github.com/dxos/sdk/issues/387) [#387](https://www.github.com/dxos/sdk/issues/387)
* Fix 'main' & 'types' fileds in appkit ([2025531](https://www.github.com/dxos/sdk/commit/2025531fbb55af02b9ac0c05fd3991dcb784dc54))
* Fix broken export ([ddae637](https://www.github.com/dxos/sdk/commit/ddae63708e88e114c9180a2a5f8294dd5a6a3954))
* Fix devtools versioning ([9745785](https://www.github.com/dxos/sdk/commit/97457857302f7e88a4606c51bc0e082ea6825928))
* Fix effects firing on every render ([e7f2f5e](https://www.github.com/dxos/sdk/commit/e7f2f5e33f2fd7a739d6e91fe8998e10180fdeea))
* Fix failing tests ([#491](https://www.github.com/dxos/sdk/issues/491)) ([b544b2a](https://www.github.com/dxos/sdk/commit/b544b2adfbac30e78eb37b6f6a328453dc9049df))
* Fix forgotten export ([ebb8cbc](https://www.github.com/dxos/sdk/commit/ebb8cbcf979c7575703dee2896263bdaf7d099ce))
* Fix jsondown failing build  ([#335](https://www.github.com/dxos/sdk/issues/335)) ([9c2fc0b](https://www.github.com/dxos/sdk/commit/9c2fc0b210d87cbe765a5361b15414b4d63530aa))
* Fix persistent storage on node ([#326](https://www.github.com/dxos/sdk/issues/326)) ([3395b84](https://www.github.com/dxos/sdk/commit/3395b8461c50c9b670558e3931880c9cd8089b67))
* Fix queue microtask shim ([aaa72f2](https://www.github.com/dxos/sdk/commit/aaa72f2af03ff8e2bf9bf719352b5785a1ac8c81))
* Fix react state leak ([#269](https://www.github.com/dxos/sdk/issues/269)) ([5677d61](https://www.github.com/dxos/sdk/commit/5677d61ee3a8649840014008352da22459e048c7))
* Fix resetting and add more logging ([cea5ece](https://www.github.com/dxos/sdk/commit/cea5ecea8e430389695e0ec26e64cc3a2e4aae77))
* Improve bot dialog ([#471](https://www.github.com/dxos/sdk/issues/471)) ([6b56498](https://www.github.com/dxos/sdk/commit/6b564985056e61a9ca5ebaff70b92eca2d273e09))
* Improve party properties usage ([#416](https://www.github.com/dxos/sdk/issues/416)) ([97bf72f](https://www.github.com/dxos/sdk/commit/97bf72f82907a46e6f89cce5f3bb6cbafca9073e))
* Increate client initialization warning timeout  ([#252](https://www.github.com/dxos/sdk/issues/252)) ([b8c2894](https://www.github.com/dxos/sdk/commit/b8c28944ee7a95f20513d40ab987732c887674e6))
* Initial attempt at party names ([#388](https://www.github.com/dxos/sdk/issues/388)) ([af9475f](https://www.github.com/dxos/sdk/commit/af9475f5de5c1d8a59700b80c70ce541ca86fdf8))
* Introduce recreating party from a snapshot ([#426](https://www.github.com/dxos/sdk/issues/426)) ([a66424b](https://www.github.com/dxos/sdk/commit/a66424b5d9850d304a5e4951ea221ea828edb266))
* Introduce sorting by relevant keywords in bot registry ([#443](https://www.github.com/dxos/sdk/issues/443)) ([d1b7452](https://www.github.com/dxos/sdk/commit/d1b7452272e69c6053ab3b701f23d5035e221dfc))
* Keychain import and export ([#398](https://www.github.com/dxos/sdk/issues/398)) ([118f7c3](https://www.github.com/dxos/sdk/commit/118f7c370ae747626888db8dfe7c528c350953ec))
* lockfile-lint, add github ([47c1ac4](https://www.github.com/dxos/sdk/commit/47c1ac42224385bcf26ee0c80c9bfe9a7628f5e8))
* locks are not re-entrant ([#446](https://www.github.com/dxos/sdk/issues/446)) ([c330f0e](https://www.github.com/dxos/sdk/commit/c330f0e036644093e5506dc21003ba16e681a1dc))
* Logging for invites ([c17a4a1](https://www.github.com/dxos/sdk/commit/c17a4a164934bb9fcafd4943ee773920728a0b78))
* main/beta/release publishing scheme ([ed97117](https://www.github.com/dxos/sdk/commit/ed971173e7efc786426f3fb5ee4f4553e9609c50))
* Make profile reactive ([#311](https://www.github.com/dxos/sdk/issues/311)) ([5ca97a5](https://www.github.com/dxos/sdk/commit/5ca97a55186b3e3e4ffa84dd475c6b45f703b842))
* More logging around invitations ([#451](https://www.github.com/dxos/sdk/issues/451)) ([a07752e](https://www.github.com/dxos/sdk/commit/a07752e9cb4f69d56fed0a16ab9eaa46bc10797e))
* not NetworkManager (yet) ([4457130](https://www.github.com/dxos/sdk/commit/44571308f44ad84836adaf8133c82ec2da8849d9))
* Observability ([dd0e18c](https://www.github.com/dxos/sdk/commit/dd0e18c5172a51c9568ca274f82cc6712ec37621))
* Pass pad metadata to pad creation function. Remove generic pad creation function. ([#234](https://www.github.com/dxos/sdk/issues/234)) ([0ab8231](https://www.github.com/dxos/sdk/commit/0ab8231599003779f4b693da040471adfb916957))
* Possible undefined member display name ([#462](https://www.github.com/dxos/sdk/issues/462)) ([aa85c7e](https://www.github.com/dxos/sdk/commit/aa85c7e2c6b84e679248005eae20cb0349df8097))
* Preserve done invitation state ([#256](https://www.github.com/dxos/sdk/issues/256)) ([4e57bb0](https://www.github.com/dxos/sdk/commit/4e57bb0fe600d5ca31b0cb8a5fe19ba0e6cc0799))
* Properly handle recoverable connectivity errors around bot registries ([#505](https://www.github.com/dxos/sdk/issues/505)) ([3f3fab1](https://www.github.com/dxos/sdk/commit/3f3fab1522723faaa6720b668b5e22fc03759c67))
* Properly restore text model from snapshot ([#502](https://www.github.com/dxos/sdk/issues/502)) ([d1c363a](https://www.github.com/dxos/sdk/commit/d1c363a91aa85a6900733045c7af75fbe67efda1))
* redo bot dialog; proper botkit-client destroy. ([#449](https://www.github.com/dxos/sdk/issues/449)) ([a0e21f7](https://www.github.com/dxos/sdk/commit/a0e21f70170421c80881108ac4bc502c013cec50))
* Refactor react-router to TS ([#459](https://www.github.com/dxos/sdk/issues/459)) ([d1e96cd](https://www.github.com/dxos/sdk/commit/d1e96cdcda9f74ccbefb058657eb68b7e9a2d9b2))
* Reimplement halo recovery ([#395](https://www.github.com/dxos/sdk/issues/395)) ([be7269f](https://www.github.com/dxos/sdk/commit/be7269f4a6454497cb113a5252ca58a2217c5c0f))
* Reimplement offline invitations ([#299](https://www.github.com/dxos/sdk/issues/299)) ([4957631](https://www.github.com/dxos/sdk/commit/495763125f62f15784a0f39d3d7387a263e00638))
* Release SDK with ECHO 2.6.5 ([8cd567b](https://www.github.com/dxos/sdk/commit/8cd567b3693445c067f812377bde38f71779a207))
* Releasing for devtools ([#497](https://www.github.com/dxos/sdk/issues/497)) ([03fca65](https://www.github.com/dxos/sdk/commit/03fca657f289053de824c04d95cfb834052e5a21))
* Remove broken humanize ([5e90f0e](https://www.github.com/dxos/sdk/commit/5e90f0e3cc3106020f829bb7433608fbb533b6da))
* Remove redundant view-model ([#342](https://www.github.com/dxos/sdk/issues/342)) ([9195024](https://www.github.com/dxos/sdk/commit/9195024daebad1d020a898c431b94b29cdbe89a1))
* Replace error view ([#266](https://www.github.com/dxos/sdk/issues/266)) ([9ca4bbf](https://www.github.com/dxos/sdk/commit/9ca4bbfce5f149040cb9c2506ae801af06edc996))
* Return profile upon creation ([#318](https://www.github.com/dxos/sdk/issues/318)) ([a8cd0b0](https://www.github.com/dxos/sdk/commit/a8cd0b0715e7240261b939c04415bcb8d74d4bf3))
* Safeguard for bot factories without names ([#423](https://www.github.com/dxos/sdk/issues/423)) ([e84b7d7](https://www.github.com/dxos/sdk/commit/e84b7d7ffa4a7cb83c40a6ec27e179d8ff5e2b44))
* Safeguards for dialogs ([#432](https://www.github.com/dxos/sdk/issues/432)) ([ae1a3d4](https://www.github.com/dxos/sdk/commit/ae1a3d405d9649ec571246db0aa02c77437cd0ac))
* Set devtools hook in client provider & add persistent storage story ([#237](https://www.github.com/dxos/sdk/issues/237)) ([ecf7624](https://www.github.com/dxos/sdk/commit/ecf7624c8ecf1bfe75a9cae8e52ebb8b908cf9d6))
* Spinner and disabled submit in redeem dialog ([#413](https://www.github.com/dxos/sdk/issues/413)) ([d0c5f7d](https://www.github.com/dxos/sdk/commit/d0c5f7d1d4de1b1d0737b7442d7738cfc3ff1a47))
* Subscribe to party updates once ([#427](https://www.github.com/dxos/sdk/issues/427)) ([f88f072](https://www.github.com/dxos/sdk/commit/f88f0727a4847e8e60c959a10c1db65a57d7a083))
* support self signed cert in BF source manager. ([#421](https://www.github.com/dxos/sdk/issues/421)) ([bacbabc](https://www.github.com/dxos/sdk/commit/bacbabc9f0ac724d7560797475ab1fb43871d85c))
* Transpile nullish coalescing and optional chaining ([3b593e9](https://www.github.com/dxos/sdk/commit/3b593e9a03d60f7f95b70174beba38794aeb5b97))
* Trigger publish ([6e4536e](https://www.github.com/dxos/sdk/commit/6e4536e1f9cb7b641f582679acda1226f466cee5))
* Trigger publish ([7482b79](https://www.github.com/dxos/sdk/commit/7482b793060d99954333b120a75f4a308c5c55c4))
* Trigger release-please ([7282bab](https://www.github.com/dxos/sdk/commit/7282bab8d8c02dc2447fac3e6c60c840194bfe95))
* Trigger version update ([6a44457](https://www.github.com/dxos/sdk/commit/6a444577cf83386c71f15fc44ad43f13da87cbd6))
* Trim item names ([#287](https://www.github.com/dxos/sdk/issues/287)) ([ff6c419](https://www.github.com/dxos/sdk/commit/ff6c4197f98bc8cd9305a4ee00bc9ba9e1861f57))
* Update babel configuration for nullish coalescence and optional chaining ([#193](https://www.github.com/dxos/sdk/issues/193)) ([c3f5367](https://www.github.com/dxos/sdk/commit/c3f536797ed09504a4c82b0bfd9662042a73880f))
* update botkit deps. ([#249](https://www.github.com/dxos/sdk/issues/249)) ([b06499a](https://www.github.com/dxos/sdk/commit/b06499a6a3d5dd29c476c49311140f142d2e0b0e))
* Update dependencies actions ([#479](https://www.github.com/dxos/sdk/issues/479)) ([f92a978](https://www.github.com/dxos/sdk/commit/f92a9782fcc68a21224e5d39fddeeabd78d426f6))
* Update deps. ([#409](https://www.github.com/dxos/sdk/issues/409)) ([6d011ba](https://www.github.com/dxos/sdk/commit/6d011ba932cc49ed2e27fc3a2e518172078e9105))
* Update echo ([6c57b89](https://www.github.com/dxos/sdk/commit/6c57b8943e185782a16cbb8cc92aa1af2cc9d574))
* Update ECHO and Mesh ([#481](https://www.github.com/dxos/sdk/issues/481)) ([4b49069](https://www.github.com/dxos/sdk/commit/4b49069b7f15f8459ab7b57c0cedfc508b738559))
* Update ECHO to latest ([#285](https://www.github.com/dxos/sdk/issues/285)) ([f78c7e0](https://www.github.com/dxos/sdk/commit/f78c7e0e9b5e784f27530cd4e6b928f3401437e0))
* Update tests ([#346](https://www.github.com/dxos/sdk/issues/346)) ([c388d08](https://www.github.com/dxos/sdk/commit/c388d084735b61ce03ed68e966d113cc4ef1d549))
* Update to new echo api ([#301](https://www.github.com/dxos/sdk/issues/301)) ([855e6e6](https://www.github.com/dxos/sdk/commit/855e6e61f174ba895054e81e64269d79c1405fc8))
* Upgrade eslint plugin ([#436](https://www.github.com/dxos/sdk/issues/436)) ([536c0bd](https://www.github.com/dxos/sdk/commit/536c0bdf6261c48eb50b487ca79896c0f61c4aca))
* Upgrade to new networking ([#467](https://www.github.com/dxos/sdk/issues/467)) ([01eebe8](https://www.github.com/dxos/sdk/commit/01eebe8f4d52c922152827a6e6242019226227a8))
* Upload devtools as artifact ([8fab1f2](https://www.github.com/dxos/sdk/commit/8fab1f2d1841c2928c3d98394359f23b76bc32c3))
* Use latest published packages. ([39d378f](https://www.github.com/dxos/sdk/commit/39d378f0f13bc8582ced4497f340b79f315d5bcf))
* Use Material-ui as a peer dependency ([#495](https://www.github.com/dxos/sdk/issues/495)) ([98e07b0](https://www.github.com/dxos/sdk/commit/98e07b03c1975429161c190846394308f2f10cf3))
* Use newest ECHO ([447a13c](https://www.github.com/dxos/sdk/commit/447a13c5e3920422d6c4108f66a15c24986f8318))
* Use newest echo, add message logger ([#447](https://www.github.com/dxos/sdk/issues/447)) ([ee21f8f](https://www.github.com/dxos/sdk/commit/ee21f8f54d15ebc45004547af7e69f370c8aa03e))
* use working codec version for now. ([#402](https://www.github.com/dxos/sdk/issues/402)) ([9335f53](https://www.github.com/dxos/sdk/commit/9335f53b6225918e0d0e47f9795a7d16129f30ed))
* UX improvements ([#482](https://www.github.com/dxos/sdk/issues/482)) ([885b5ad](https://www.github.com/dxos/sdk/commit/885b5adfdb91bed354d5b80c58ef778398f2ae0d))
* Version for devtools ([921a694](https://www.github.com/dxos/sdk/commit/921a694aed4eb588622eddf34a0e42ff40c9196f))
* versions ([250300e](https://www.github.com/dxos/sdk/commit/250300e654cd4e862f229c293d05f23b4ec51816))

## [2.9.0](https://www.github.com/dxos/sdk/compare/v2.8.0...v2.9.0) (2021-02-03)


### ⚠ BREAKING CHANGES

* Reverted breaking changes from the migration.

### Features

* Revert WNS migration ([#512](https://www.github.com/dxos/sdk/issues/512)) ([79a2dfe](https://www.github.com/dxos/sdk/commit/79a2dfe783920ccab87ca544bbcb990825554749))

## [2.8.0](https://www.github.com/dxos/sdk/compare/v2.7.49...v2.8.0) (2021-01-19)


### ⚠ BREAKING CHANGES

* ClientConfig expects registry, not wns property
* Party import feature expects models with dxn:// registry
* Various env variables changed prefix to DX

### Features

* WNS migration ([03088b9](https://www.github.com/dxos/sdk/commit/03088b980409361e92579712b0bd15ee971a0689))
* WNS migration ([#507](https://www.github.com/dxos/sdk/issues/507)) ([b615b0f](https://www.github.com/dxos/sdk/commit/b615b0fc9891cdc5f42c5066541336a3b99bb63c))


### Bug Fixes

* Fix devtools versioning ([da971e0](https://www.github.com/dxos/sdk/commit/da971e00f6ea3eed29233f0365751455b419af6d))
* Properly handle recoverable connectivity errors around bot registries ([#505](https://www.github.com/dxos/sdk/issues/505)) ([6496ac0](https://www.github.com/dxos/sdk/commit/6496ac0423c7448336d1f0164914d0670a52278e))
* Properly restore text model from snapshot ([#502](https://www.github.com/dxos/sdk/issues/502)) ([b8bfad1](https://www.github.com/dxos/sdk/commit/b8bfad122ef2d4aa011aa34e1f50a0e64a18db19))

### [2.7.49](https://www.github.com/dxos/sdk/compare/v2.7.48...v2.7.49) (2020-12-23)


### Bug Fixes

* Upload devtools as artifact ([3ff8514](https://www.github.com/dxos/sdk/commit/3ff85144125680dd1a4910ebff3a5f6952ecf290))

### [2.7.48](https://www.github.com/dxos/sdk/compare/v2.7.47...v2.7.48) (2020-12-23)


### Bug Fixes

* Version for devtools ([fb9293e](https://www.github.com/dxos/sdk/commit/fb9293e6eef814d5d50d146aebcc1df1daf0df01))

### [2.7.47](https://www.github.com/dxos/sdk/compare/v2.7.46...v2.7.47) (2020-12-23)


### Bug Fixes

* Releasing for devtools ([#497](https://www.github.com/dxos/sdk/issues/497)) ([5b5323a](https://www.github.com/dxos/sdk/commit/5b5323aa9e51a0439b498d30fe675869d194c7f3))
* Use Material-ui as a peer dependency ([#495](https://www.github.com/dxos/sdk/issues/495)) ([2ca5b7d](https://www.github.com/dxos/sdk/commit/2ca5b7dbb52104e2c9e6fed2003aba30e903d42f))

### [2.7.46](https://www.github.com/dxos/sdk/compare/v2.7.45...v2.7.46) (2020-12-22)


### Features

* Add initialization loader ([30988b1](https://www.github.com/dxos/sdk/commit/30988b135162e7826e995b8a46686792546b54fc))
* Control logging output in devtools ([#490](https://www.github.com/dxos/sdk/issues/490)) ([badcb99](https://www.github.com/dxos/sdk/commit/badcb9925a55cfdf1bd06226ba814cafe51000d7))


### Bug Fixes

* Fix failing tests ([#491](https://www.github.com/dxos/sdk/issues/491)) ([7eab290](https://www.github.com/dxos/sdk/commit/7eab2904e1d4edc44ded58109abfe60e641a615a))

### [2.7.45](https://www.github.com/dxos/sdk/compare/v2.7.44...v2.7.45) (2020-12-22)


### Bug Fixes

* Accept textual party contents for import ([#487](https://www.github.com/dxos/sdk/issues/487)) ([9cd22ae](https://www.github.com/dxos/sdk/commit/9cd22ae11fa293ee7e423b64fce22cca5af3507d))

### [2.7.44](https://www.github.com/dxos/sdk/compare/v2.7.43...v2.7.44) (2020-12-17)


### Bug Fixes

* Export devtools context interface ([#478](https://www.github.com/dxos/sdk/issues/478)) ([94d2775](https://www.github.com/dxos/sdk/commit/94d277579199096e85810327092a61a155146950))
* Update dependencies actions ([#479](https://www.github.com/dxos/sdk/issues/479)) ([3eb9257](https://www.github.com/dxos/sdk/commit/3eb92575e3e44fe154219fd35fe5c71cf1dc83b2))
* Update ECHO and Mesh ([#481](https://www.github.com/dxos/sdk/issues/481)) ([76758d4](https://www.github.com/dxos/sdk/commit/76758d4786484d63900b228b7e62e46408cb1ae9))
* UX improvements ([#482](https://www.github.com/dxos/sdk/issues/482)) ([21a9b5e](https://www.github.com/dxos/sdk/commit/21a9b5ef37bcbabc6d965eab3e37b856c88f5038))

### [2.7.43](https://www.github.com/dxos/sdk/compare/v2.7.42...v2.7.43) (2020-12-16)


### Bug Fixes

* Trigger version update ([31b9a0b](https://www.github.com/dxos/sdk/commit/31b9a0b5d1bad9d02434a1d7c1473ff508e55c68))

### [2.7.42](https://www.github.com/dxos/sdk/compare/v2.7.41...v2.7.42) (2020-12-16)


### Bug Fixes

* Improve bot dialog ([#471](https://www.github.com/dxos/sdk/issues/471)) ([11f3c26](https://www.github.com/dxos/sdk/commit/11f3c26e5427ee66fc1ef38601005619f69beff2))

### [2.7.41](https://www.github.com/dxos/sdk/compare/v2.7.40...v2.7.41) (2020-12-15)


### Bug Fixes

* Trigger publish ([9971831](https://www.github.com/dxos/sdk/commit/99718319c451f28375516362a3e52b6c1239b715))

### [2.7.40](https://www.github.com/dxos/sdk/compare/v2.7.39...v2.7.40) (2020-12-15)


### Bug Fixes

* Add pending invitations names ([#465](https://www.github.com/dxos/sdk/issues/465)) ([c2dc2bf](https://www.github.com/dxos/sdk/commit/c2dc2bfedcc31b208742df5ec167b3ca4b36158a))
* Create parties settings dialog ([#463](https://www.github.com/dxos/sdk/issues/463)) ([3724f4b](https://www.github.com/dxos/sdk/commit/3724f4b5959efb10242d2a0124b6c09c741251d7))
* Dialogs icon and title ([#468](https://www.github.com/dxos/sdk/issues/468)) ([f332a02](https://www.github.com/dxos/sdk/commit/f332a0245bb098b6308c912eda7041ec4e5fe22a))
* Upgrade to new networking ([#467](https://www.github.com/dxos/sdk/issues/467)) ([11f3e93](https://www.github.com/dxos/sdk/commit/11f3e93d05003f81233b174d580706fc567e7702))

### [2.7.39](https://www.github.com/dxos/sdk/compare/v2.7.38...v2.7.39) (2020-12-14)


### Bug Fixes

* Possible undefined member display name ([#462](https://www.github.com/dxos/sdk/issues/462)) ([b3a5725](https://www.github.com/dxos/sdk/commit/b3a572582989c00716294dd5d1398a6fcaec2e94))
* Refactor react-router to TS ([#459](https://www.github.com/dxos/sdk/issues/459)) ([422d1bf](https://www.github.com/dxos/sdk/commit/422d1bf702437e1830a1e7affb06d40fa1743738))

### [2.7.38](https://www.github.com/dxos/sdk/compare/v2.7.37...v2.7.38) (2020-12-10)


### Bug Fixes

* not NetworkManager (yet) ([140fe3f](https://www.github.com/dxos/sdk/commit/140fe3f63ab36ed8cb431134471ca10e8aef05c9))
* versions ([d1e18b7](https://www.github.com/dxos/sdk/commit/d1e18b7d4c8458b9d016b40556fbf7e00654652b))

### [2.7.37](https://www.github.com/dxos/sdk/compare/v2.7.36...v2.7.37) (2020-12-10)


### Bug Fixes

* Observability ([d174b87](https://www.github.com/dxos/sdk/commit/d174b87afc2068b95e9053acabf621cc85341407))

### [2.7.36](https://www.github.com/dxos/sdk/compare/v2.7.35...v2.7.36) (2020-12-10)


### Bug Fixes

* Convert react-appkit to TS ([#453](https://www.github.com/dxos/sdk/issues/453)) ([1993903](https://www.github.com/dxos/sdk/commit/199390318a957c391efa61fc9ae2d0bbefcce778))
* More logging around invitations ([#451](https://www.github.com/dxos/sdk/issues/451)) ([b926590](https://www.github.com/dxos/sdk/commit/b92659024d7c9485d867efe8038246f2fc148c04))

### [2.7.35](https://www.github.com/dxos/sdk/compare/v2.7.34...v2.7.35) (2020-12-09)


### Bug Fixes

* redo bot dialog; proper botkit-client destroy. ([#449](https://www.github.com/dxos/sdk/issues/449)) ([7c8058d](https://www.github.com/dxos/sdk/commit/7c8058da7a4d7bd67047f9ee338845c0163e76d4))

### [2.7.34](https://www.github.com/dxos/sdk/compare/v2.7.33...v2.7.34) (2020-12-09)


### Bug Fixes

* Fix resetting and add more logging ([0f25197](https://www.github.com/dxos/sdk/commit/0f25197705f9e27a6fee715e3c2ffc32ab7e8f8e))
* Logging for invites ([1d20c79](https://www.github.com/dxos/sdk/commit/1d20c7972a3aa95f8fa00f5e1210a61b97715638))

### [2.7.33](https://www.github.com/dxos/sdk/compare/v2.7.32...v2.7.33) (2020-12-09)


### Bug Fixes

* Introduce sorting by relevant keywords in bot registry ([#443](https://www.github.com/dxos/sdk/issues/443)) ([1d3c9d2](https://www.github.com/dxos/sdk/commit/1d3c9d2c091260b3d9beef2b4fddc574c0392b19))
* locks are not re-entrant ([#446](https://www.github.com/dxos/sdk/issues/446)) ([5d83381](https://www.github.com/dxos/sdk/commit/5d83381696e2e939f7d588c99268498db5d0c2ec))
* Use newest echo, add message logger ([#447](https://www.github.com/dxos/sdk/issues/447)) ([f1b4a7c](https://www.github.com/dxos/sdk/commit/f1b4a7c633b3a3da99fee317d6aa270165bb862c))

### [2.7.32](https://www.github.com/dxos/sdk/compare/v2.7.31...v2.7.32) (2020-12-08)


### Bug Fixes

* Exact versions for dxos packages ([#438](https://www.github.com/dxos/sdk/issues/438)) ([c86ec3c](https://www.github.com/dxos/sdk/commit/c86ec3c12df3019badd8ee6cbd411e2398b48c68))

### [2.7.31](https://www.github.com/dxos/sdk/compare/v2.7.30...v2.7.31) (2020-12-08)


### Bug Fixes

* Upgrade eslint plugin ([#436](https://www.github.com/dxos/sdk/issues/436)) ([aefe8b1](https://www.github.com/dxos/sdk/commit/aefe8b1000b9a4d5441969d44ff50c45f5a91b72))

### [2.7.30](https://www.github.com/dxos/sdk/compare/v2.7.29...v2.7.30) (2020-12-08)


### Bug Fixes

* add missing fileds for bf status. ([#434](https://www.github.com/dxos/sdk/issues/434)) ([5e4d708](https://www.github.com/dxos/sdk/commit/5e4d70850634efe479165e7af5283ca664978964))

### [2.7.29](https://www.github.com/dxos/sdk/compare/v2.7.28...v2.7.29) (2020-12-08)


### Bug Fixes

* botkit regressions fix & improvements. ([#429](https://www.github.com/dxos/sdk/issues/429)) ([1362a76](https://www.github.com/dxos/sdk/commit/1362a76c8aa0d12769a63f4d531bfe6af04ea272))
* Safeguards for dialogs ([#432](https://www.github.com/dxos/sdk/issues/432)) ([32e7a3c](https://www.github.com/dxos/sdk/commit/32e7a3cf1d658991f280b8185fcfeae338159b11))

### [2.7.28](https://www.github.com/dxos/sdk/compare/v2.7.27...v2.7.28) (2020-12-07)


### Bug Fixes

* Introduce recreating party from a snapshot ([#426](https://www.github.com/dxos/sdk/issues/426)) ([5462df0](https://www.github.com/dxos/sdk/commit/5462df015d55eed04d44ddd7ecb5fef325c382ff))

### [2.7.27](https://www.github.com/dxos/sdk/compare/v2.7.26...v2.7.27) (2020-12-04)


### Bug Fixes

* Subscribe to party updates once ([#427](https://www.github.com/dxos/sdk/issues/427)) ([4748b91](https://www.github.com/dxos/sdk/commit/4748b91bb2c5e9ecd3bae9abd48912530850f907))

### [2.7.26](https://www.github.com/dxos/sdk/compare/v2.7.25...v2.7.26) (2020-12-03)


### Bug Fixes

* Safeguard for bot factories without names ([#423](https://www.github.com/dxos/sdk/issues/423)) ([4fdb94f](https://www.github.com/dxos/sdk/commit/4fdb94f7abe26ad8a32ec6807f16e7d490e0db74))
* support self signed cert in BF source manager. ([#421](https://www.github.com/dxos/sdk/issues/421)) ([0537bff](https://www.github.com/dxos/sdk/commit/0537bffd95f1510eac3db87ba620c37e15272756))

### [2.7.25](https://www.github.com/dxos/sdk/compare/v2.7.24...v2.7.25) (2020-12-02)


### Bug Fixes

* Trigger release-please ([63799bc](https://www.github.com/dxos/sdk/commit/63799bc0318b452e9783c4fbaae44b0af19de473))

### [2.7.24](https://www.github.com/dxos/sdk/compare/v2.7.23...v2.7.24) (2020-12-02)


### Bug Fixes

* Improve party properties usage ([#416](https://www.github.com/dxos/sdk/issues/416)) ([1e8db78](https://www.github.com/dxos/sdk/commit/1e8db78c6050e15cada20eb50e904d98e1b7492e))
* Spinner and disabled submit in redeem dialog ([#413](https://www.github.com/dxos/sdk/issues/413)) ([6b3b548](https://www.github.com/dxos/sdk/commit/6b3b548557ba91fa4d73464a69685c1053b9ec6f))

### [2.7.23](https://www.github.com/dxos/sdk/compare/v2.7.22...v2.7.23) (2020-11-30)


### Bug Fixes

* Update deps. ([#409](https://www.github.com/dxos/sdk/issues/409)) ([c1516a1](https://www.github.com/dxos/sdk/commit/c1516a1742394e048e7c2e0618a1028b60296cfe))

### [2.7.22](https://www.github.com/dxos/sdk/compare/v2.7.21...v2.7.22) (2020-11-28)


### Bug Fixes

* use working codec version for now. ([#402](https://www.github.com/dxos/sdk/issues/402)) ([689ebbd](https://www.github.com/dxos/sdk/commit/689ebbd4bd16a4bb6402d518534930ca897af309))

### [2.7.21](https://www.github.com/dxos/sdk/compare/v2.7.20...v2.7.21) (2020-11-27)


### Bug Fixes

* Keychain import and export ([#398](https://www.github.com/dxos/sdk/issues/398)) ([4cee55b](https://www.github.com/dxos/sdk/commit/4cee55b5f3cafd4557b629f61c9298dfe9bee95e))

### [2.7.20](https://www.github.com/dxos/sdk/compare/v2.7.19...v2.7.20) (2020-11-27)


### Bug Fixes

* Reimplement halo recovery ([#395](https://www.github.com/dxos/sdk/issues/395)) ([7ee9c31](https://www.github.com/dxos/sdk/commit/7ee9c31ad2c002e2d44a6505bc86882ca06f5c04))

### [2.7.19](https://www.github.com/dxos/sdk/compare/v2.7.18...v2.7.19) (2020-11-26)


### Bug Fixes

* Remove broken humanize ([8ad4f84](https://www.github.com/dxos/sdk/commit/8ad4f848f0b45f41392d3b5d6a627aa860d95d69))

### [2.7.18](https://www.github.com/dxos/sdk/compare/v2.7.17...v2.7.18) (2020-11-26)


### Bug Fixes

* First version of party activation ([#390](https://www.github.com/dxos/sdk/issues/390)) ([84cc1f1](https://www.github.com/dxos/sdk/commit/84cc1f117c95c83af9d4683805a6127978614988)), closes [#387](https://www.github.com/dxos/sdk/issues/387) [#387](https://www.github.com/dxos/sdk/issues/387)
* Initial attempt at party names ([#388](https://www.github.com/dxos/sdk/issues/388)) ([5c18e80](https://www.github.com/dxos/sdk/commit/5c18e80d7bb96b3b0ea881624176119afb50b0a9))

### [2.7.17](https://www.github.com/dxos/sdk/compare/v2.7.16...v2.7.17) (2020-11-25)


### Bug Fixes

* Release SDK with ECHO 2.6.5 ([ca733a0](https://www.github.com/dxos/sdk/commit/ca733a01e78bf4655b2837e409c853259d36d2e1))

### [2.7.16](https://www.github.com/dxos/sdk/compare/v2.7.15...v2.7.16) (2020-11-24)


### Bug Fixes

* Device invitation flow uniform with regular invitations ([#378](https://www.github.com/dxos/sdk/issues/378)) ([a436387](https://www.github.com/dxos/sdk/commit/a436387768077de6de415ebc01d373c1d400f694))

### [2.7.15](https://www.github.com/dxos/sdk/compare/v2.7.14...v2.7.15) (2020-11-23)


### Bug Fixes

* Add first version of device invite ([#372](https://www.github.com/dxos/sdk/issues/372)) ([dec8ee4](https://www.github.com/dxos/sdk/commit/dec8ee4a045b975b4a6937a7802bb9490930d8df))

### [2.7.14](https://www.github.com/dxos/sdk/compare/v2.7.13...v2.7.14) (2020-11-20)


### Bug Fixes

* Export registries ([#363](https://www.github.com/dxos/sdk/issues/363)) ([0d7b55d](https://www.github.com/dxos/sdk/commit/0d7b55dbdac916ae9b73ed738e8337d8d0b77f5e))

### [2.7.13](https://www.github.com/dxos/sdk/compare/v2.7.12...v2.7.13) (2020-11-20)


### Bug Fixes

* Trigger publish ([a81428d](https://www.github.com/dxos/sdk/commit/a81428d106406d75876915c95400ab01980f87c7))

### [2.7.12](https://www.github.com/dxos/sdk/compare/v2.7.11...v2.7.12) (2020-11-20)


### Bug Fixes

* Bot factory version. ([#357](https://www.github.com/dxos/sdk/issues/357)) ([25daefe](https://www.github.com/dxos/sdk/commit/25daefedca86c624129c5b540a7c8dfaf4c77de8))
* Update tests ([#346](https://www.github.com/dxos/sdk/issues/346)) ([e7ffce5](https://www.github.com/dxos/sdk/commit/e7ffce5798f937275bc0fcc063d1946df6ef2808))

### [2.7.11](https://www.github.com/dxos/sdk/compare/v2.7.10...v2.7.11) (2020-11-18)


### Bug Fixes

* Add more logging. ([#347](https://www.github.com/dxos/sdk/issues/347)) ([962a628](https://www.github.com/dxos/sdk/commit/962a628f7d2580a42a6fedcc4189b34189055087))

### [2.7.10](https://www.github.com/dxos/sdk/compare/v2.7.9...v2.7.10) (2020-11-18)


### Bug Fixes

* Remove redundant view-model ([#342](https://www.github.com/dxos/sdk/issues/342)) ([5ba537d](https://www.github.com/dxos/sdk/commit/5ba537dfd01fc4f77f7d07c83e77dc4b59ac91d8))

### [2.7.9](https://www.github.com/dxos/sdk/compare/v2.7.8...v2.7.9) (2020-11-17)


### Bug Fixes

* Add a step to build storybook ([#333](https://www.github.com/dxos/sdk/issues/333)) ([e72f918](https://www.github.com/dxos/sdk/commit/e72f918ca7f69837ec4d3cfeab6521511d95b191))

### [2.7.8](https://www.github.com/dxos/sdk/compare/v2.7.7...v2.7.8) (2020-11-17)


### Bug Fixes

* Fix jsondown failing build  ([#335](https://www.github.com/dxos/sdk/issues/335)) ([739bff2](https://www.github.com/dxos/sdk/commit/739bff2db14d45c3296fc0487f4463d9b39d3ec7))

### [2.7.7](https://www.github.com/dxos/sdk/compare/v2.7.6...v2.7.7) (2020-11-13)


### Bug Fixes

* Fix persistent storage on node ([#326](https://www.github.com/dxos/sdk/issues/326)) ([3f6d8e3](https://www.github.com/dxos/sdk/commit/3f6d8e36a20a14f6801963ce2e4531ea0ae5e3c2))
* Return profile upon creation ([#318](https://www.github.com/dxos/sdk/issues/318)) ([3d9cda9](https://www.github.com/dxos/sdk/commit/3d9cda962213111b23e9ee311d6b18b0d4eda427))

### [2.7.6](https://www.github.com/dxos/sdk/compare/v2.7.5...v2.7.6) (2020-11-12)


### Bug Fixes

* Make profile reactive ([#311](https://www.github.com/dxos/sdk/issues/311)) ([343f0fc](https://www.github.com/dxos/sdk/commit/343f0fc3944244801a3c7fc997dcacddfaf53d14))

### [2.7.5](https://www.github.com/dxos/sdk/compare/v2.7.4...v2.7.5) (2020-11-10)


### Bug Fixes

* Bring back bot invites ([#310](https://www.github.com/dxos/sdk/issues/310)) ([b3e54df](https://www.github.com/dxos/sdk/commit/b3e54df6847f3f0d0de126d305316697fcc64bcd))
* Update echo ([d2615a5](https://www.github.com/dxos/sdk/commit/d2615a55a8450bfd25bd9f47ffd9e8e5715c382f))
* Update to new echo api ([#301](https://www.github.com/dxos/sdk/issues/301)) ([7303b81](https://www.github.com/dxos/sdk/commit/7303b8172bee1e6d2d90193c767417e815a47f48))

### [2.7.4](https://www.github.com/dxos/sdk/compare/v2.7.3...v2.7.4) (2020-11-04)


### Bug Fixes

* Reimplement offline invitations ([#299](https://www.github.com/dxos/sdk/issues/299)) ([d73e7ec](https://www.github.com/dxos/sdk/commit/d73e7ec342e04c0becbde2fc7381b8361d7e079d))

### [2.7.3](https://www.github.com/dxos/sdk/compare/v2.7.2...v2.7.3) (2020-10-30)


### Bug Fixes

* Add a function to pre-initialize client ([#292](https://www.github.com/dxos/sdk/issues/292)) ([c23d40b](https://www.github.com/dxos/sdk/commit/c23d40bfce8744f3290a4fe8d8b06de5590e11c5))
* Trim item names ([#287](https://www.github.com/dxos/sdk/issues/287)) ([4a2f1d9](https://www.github.com/dxos/sdk/commit/4a2f1d9a23bba65c3d4e41eea3906a91b3c411ae))

### [2.7.2](https://www.github.com/dxos/sdk/compare/v2.7.1...v2.7.2) (2020-10-30)


### Bug Fixes

* Update ECHO to latest ([#285](https://www.github.com/dxos/sdk/issues/285)) ([f086bc2](https://www.github.com/dxos/sdk/commit/f086bc2210cc59f36feff6601c5414349aaf6431))

### [2.7.1](https://www.github.com/dxos/sdk/compare/v2.7.0...v2.7.1) (2020-10-30)


### Bug Fixes

* Use newest ECHO ([6694ce2](https://www.github.com/dxos/sdk/commit/6694ce210d926100a7aff426070a1290c6fad4fb))

## [2.7.0](https://www.github.com/dxos/sdk/compare/v2.6.5...v2.7.0) (2020-10-29)


### Features

* Party snapshots ([#275](https://www.github.com/dxos/sdk/issues/275)) ([ebbde8e](https://www.github.com/dxos/sdk/commit/ebbde8eb255dff63304b5bfea0d4284b8dcd5db1))


### Bug Fixes

* Allow the user to not specify WNS ([#273](https://www.github.com/dxos/sdk/issues/273)) ([2e2e228](https://www.github.com/dxos/sdk/commit/2e2e228e9f62ced477d46a69acf85e843efef417))
* Disable broken members link. ([#271](https://www.github.com/dxos/sdk/issues/271)) ([ad588d0](https://www.github.com/dxos/sdk/commit/ad588d0bf61714f52c9d14cc683f000263d5c375))

### [2.6.5](https://www.github.com/dxos/sdk/compare/v2.6.4...v2.6.5) (2020-10-28)


### Bug Fixes

* Fix react state leak ([#269](https://www.github.com/dxos/sdk/issues/269)) ([15a4e80](https://www.github.com/dxos/sdk/commit/15a4e80d3cf9b8427b6a36780760bc7d415b700d))
* Replace error view ([#266](https://www.github.com/dxos/sdk/issues/266)) ([d2f1b83](https://www.github.com/dxos/sdk/commit/d2f1b83579b07bfcd9596b4796c9b5c8a8bb6c29))

### [2.6.4](https://www.github.com/dxos/sdk/compare/v2.6.3...v2.6.4) (2020-10-26)


### Bug Fixes

* Fix broken export ([7867dca](https://www.github.com/dxos/sdk/commit/7867dca9a1e16fe978ce5092cff0239c681e07a8))

### [2.6.3](https://www.github.com/dxos/sdk/compare/v2.6.2...v2.6.3) (2020-10-26)


### Bug Fixes

* Fix forgotten export ([ca843ff](https://www.github.com/dxos/sdk/commit/ca843ff645f3a5395a68684b3cb4e2a2a19ee763))

### [2.6.2](https://www.github.com/dxos/sdk/compare/v2.6.1...v2.6.2) (2020-10-26)


### Bug Fixes

* Transpile nullish coalescing and optional chaining ([e1456a2](https://www.github.com/dxos/sdk/commit/e1456a2c0cb530bfd7849ac4b1810dc0db8d8f3c))

### [2.6.1](https://www.github.com/dxos/sdk/compare/v2.6.0...v2.6.1) (2020-10-26)


### Bug Fixes

* Fix 'main' & 'types' fileds in appkit ([218e92a](https://www.github.com/dxos/sdk/commit/218e92a44426badf70749469351b65aa25c82c1c))

## [2.6.0](https://www.github.com/dxos/sdk/compare/v2.5.2...v2.6.0) (2020-10-26)


### Features

* Add pad registration to AppKitProvider ([16de2dc](https://www.github.com/dxos/sdk/commit/16de2dc489c760739eaec79be196a610ef4e8c2f))
* Rename AppKitContextProvider -> AppKitProvider ([3879765](https://www.github.com/dxos/sdk/commit/38797653686e57702912c24ee60acf294f804e50))


### Bug Fixes

* Add 'persistent' storage type that selects the default driver for the platform ([be3fc2d](https://www.github.com/dxos/sdk/commit/be3fc2d7910d221a5782a71d5a35772cc91d24e0))
* Deprecate check for errors ([35e0a40](https://www.github.com/dxos/sdk/commit/35e0a40140b1b72792694940c1effa43b9a11e38))

### [2.5.2](https://www.github.com/dxos/sdk/compare/v2.5.1...v2.5.2) (2020-10-26)


### Features

* Rewrite client config ([#258](https://www.github.com/dxos/sdk/issues/258)) ([d52d8e9](https://www.github.com/dxos/sdk/commit/d52d8e9f0937d37d4d9c4e586c48e8966ba60fd5))


### Bug Fixes

* Preserve done invitation state ([#256](https://www.github.com/dxos/sdk/issues/256)) ([945fe0f](https://www.github.com/dxos/sdk/commit/945fe0fb7b619cb2a2dcd6813ec0c9afe552aef2))

### [2.5.1](https://www.github.com/dxos/sdk/compare/v2.5.0...v2.5.1) (2020-10-23)


### Features

* Restore party item restore functionality ([#253](https://www.github.com/dxos/sdk/issues/253)) ([4ea6819](https://www.github.com/dxos/sdk/commit/4ea6819c51ed723f3e4bd63a24e8871f4cb29583))


### Bug Fixes

* automatically close redeem dialog and restore state to initial ([#255](https://www.github.com/dxos/sdk/issues/255)) ([662a493](https://www.github.com/dxos/sdk/commit/662a493f63365310389cc2541d5db06bf87a6836))
* Increate client initialization warning timeout  ([#252](https://www.github.com/dxos/sdk/issues/252)) ([1920095](https://www.github.com/dxos/sdk/commit/1920095f6675a76d916baa81269ca9f974c35f4a))

## [2.5.0](https://www.github.com/dxos/sdk/compare/v2.4.0...v2.5.0) (2020-10-22)


### Features

* Bring back generic pad settings ([#231](https://www.github.com/dxos/sdk/issues/231)) ([0ea5a36](https://www.github.com/dxos/sdk/commit/0ea5a3694e969563c1de0c195a3ab7dab2f3a522))


### Bug Fixes

* Default party display name ([#247](https://www.github.com/dxos/sdk/issues/247)) ([2dac75a](https://www.github.com/dxos/sdk/commit/2dac75a85c7721f07324b67b0a71f99b3bee3783))
* Disable broken party settings ([#246](https://www.github.com/dxos/sdk/issues/246)) ([8c7874a](https://www.github.com/dxos/sdk/commit/8c7874a763c5593be9a5291c43fd924e18dac381))
* Fix effects firing on every render ([239c720](https://www.github.com/dxos/sdk/commit/239c7200a55facaceddc2f731a85d8c02cb91b70))
* Pass pad metadata to pad creation function. Remove generic pad creation function. ([#234](https://www.github.com/dxos/sdk/issues/234)) ([25d905d](https://www.github.com/dxos/sdk/commit/25d905d44f2bd0480da46c8add3c3b052e581a80))
* Set devtools hook in client provider & add persistent storage story ([#237](https://www.github.com/dxos/sdk/issues/237)) ([53a1180](https://www.github.com/dxos/sdk/commit/53a11800868face50451d795b0a89649be40d272))
* update botkit deps. ([#249](https://www.github.com/dxos/sdk/issues/249)) ([cff72c6](https://www.github.com/dxos/sdk/commit/cff72c62ce0d39210e2f39a649dfa08edfccb2b1))

## [2.4.0](https://www.github.com/dxos/sdk/compare/v2.3.1...v2.4.0) (2020-10-21)


### Features

* react-client refactoring & stability improvements ([#227](https://www.github.com/dxos/sdk/issues/227)) ([9bf0e67](https://www.github.com/dxos/sdk/commit/9bf0e6789b107eb1f0065cfe8219243fd0755637))


### Bug Fixes

* Fix queue microtask shim ([36f0b8d](https://www.github.com/dxos/sdk/commit/36f0b8d436dd194d3d0858774ed9cbf34b9e3cfa))

### [2.3.1](https://www.github.com/dxos/sdk/compare/v2.3.0...v2.3.1) (2020-10-20)


### Bug Fixes

* bot to emit events on party join. ([#222](https://www.github.com/dxos/sdk/issues/222)) ([02fde00](https://www.github.com/dxos/sdk/commit/02fde00612e2068849cdb3a57b16d051793b5235))

## [2.3.0](https://www.github.com/dxos/sdk/compare/v2.2.1...v2.3.0) (2020-10-19)


### Features

* Trigger publish ([65eb87e](https://www.github.com/dxos/sdk/commit/65eb87e6c4b736ec3041e9a6607396b84acf1259))

### [2.2.1](https://www.github.com/dxos/sdk/compare/v2.2.0...v2.2.1) (2020-10-15)


### Bug Fixes

* Add lockfile linting. ([2b2f111](https://www.github.com/dxos/sdk/commit/2b2f1112d9072f86d80c1d27c69e97c93a430440))
* lockfile-lint, add github ([dfe5f2c](https://www.github.com/dxos/sdk/commit/dfe5f2c03a8a10dab5d511d1b2667692be3896f8))

## [2.2.0](https://www.github.com/dxos/sdk/compare/v2.1.2...v2.2.0) (2020-10-15)


### Features

* Required changes for implementing new Echo in Teamwork ([#210](https://www.github.com/dxos/sdk/issues/210)) ([781369c](https://www.github.com/dxos/sdk/commit/781369c10a539a57f6f8eeba3bb40410e72ccbb7))

### [2.1.2](https://www.github.com/dxos/sdk/compare/v2.1.1...v2.1.2) (2020-10-14)


### Bug Fixes

* Enable publishing ([0f2d365](https://www.github.com/dxos/sdk/commit/0f2d365242209a0d92f184d099caf6272bb55add))

### [2.1.1](https://www.github.com/dxos/sdk/compare/v2.1.0...v2.1.1) (2020-10-14)


### Bug Fixes

* Bump patch ([3ff2098](https://www.github.com/dxos/sdk/commit/3ff2098d5ee71b86fe5f8c072a60ff77035fdd0c))

## [2.1.0](https://www.github.com/dxos/sdk/compare/v2.0.0...v2.1.0) (2020-10-14)


### Features

* Bump minor. ([af95b56](https://www.github.com/dxos/sdk/commit/af95b5618b72d0ea5a345fd69cedd27083ddb317))

## [2.0.0](https://www.github.com/dxos/sdk/compare/v1.0.0...v2.0.0) (2020-10-14)


### ⚠ BREAKING CHANGES

* Bump major.

### Features

* Bump major. ([aa9dcd2](https://www.github.com/dxos/sdk/commit/aa9dcd2950bbb69b249f27194be1d69062491674))

## 1.0.0 (2020-10-14)


### ⚠ BREAKING CHANGES

* Publish to NPM

### Features

* Initial release-please. ([5564a98](https://www.github.com/dxos/sdk/commit/5564a987baa537c117a975c58392cc85672e44ed))
* Publish to NPM ([a18cd34](https://www.github.com/dxos/sdk/commit/a18cd3467baf840bbd0a29c3b55ea2e51b276dd3))


### Bug Fixes

* Disable alpha publishing until correct version. ([9cb4498](https://www.github.com/dxos/sdk/commit/9cb449862c168c86054bb6567ba20d7dc000c287))
* main/beta/release publishing scheme ([8631ea4](https://www.github.com/dxos/sdk/commit/8631ea429e5f8971b8fb0930b35ad47f3d41bf71))
* Update babel configuration for nullish coalescence and optional chaining ([#193](https://www.github.com/dxos/sdk/issues/193)) ([f1a6b9e](https://www.github.com/dxos/sdk/commit/f1a6b9e46e0a88297fb82c166056a7b2d7f9243b))
* Use latest published packages. ([7a53ee3](https://www.github.com/dxos/sdk/commit/7a53ee39b6a5829408795fec8a6cbddc506ebc3b))
