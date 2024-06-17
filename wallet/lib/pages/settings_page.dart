import 'dart:ui';

import 'package:fl_toast/fl_toast.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get_it/get_it.dart';
import 'package:walletconnect_flutter_v2/walletconnect_flutter_v2.dart';
import 'package:walletconnect_flutter_v2_wallet/dependencies/bottom_sheet/i_bottom_sheet_service.dart';
import 'package:walletconnect_flutter_v2_wallet/dependencies/key_service/i_key_service.dart';
import 'package:walletconnect_flutter_v2_wallet/utils/constants.dart';
import 'package:walletconnect_flutter_v2_wallet/widgets/custom_button.dart';
import 'package:walletconnect_flutter_v2_wallet/widgets/recover_from_seed.dart';

import 'package:package_info_plus/package_info_plus.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  String? version;
  @override
  void initState() {
    super.initState();
    PackageInfo.fromPlatform().then((info) {
      setState(() {
        version =
            '${info.version} (${info.buildNumber}) - SDK v$packageVersion';
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final keysService = GetIt.I<IKeyService>();
    final chainKeys = keysService.getKeysForChain('eip155:1');
    return Padding(
      padding: const EdgeInsets.all(12.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                children: [
                  const Padding(
                    padding: EdgeInsets.only(left: 8.0, bottom: 8.0),
                    child: Text(
                      'Account',
                      style: TextStyle(
                        color: Colors.black,
                        fontSize: 16.0,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  _DataContainer(
                    title: 'CAIP-10',
                    data: 'eip155:1:${chainKeys.first.address}',
                  ),
                  const SizedBox(height: 12.0),
                  _DataContainer(
                    title: 'Public key',
                    data: chainKeys.first.publicKey,
                  ),
                  const SizedBox(height: 12.0),
                  _DataContainer(
                    title: 'Private key',
                    data: chainKeys.first.privateKey,
                    blurred: true,
                  ),
                  const SizedBox(height: 12.0),
                  FutureBuilder<SharedPreferences>(
                    future: SharedPreferences.getInstance(),
                    builder: (context, snapshot) {
                      return _DataContainer(
                        title: 'Seed phrase',
                        data: snapshot.data?.getString('mnemonic') ?? '',
                        blurred: true,
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 8.0),
          Row(
            children: [
              Expanded(
                child: Text(
                  version ?? '',
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 11.0),
                ),
              )
            ],
          ),
          const SizedBox(height: 8.0),
          Row(
            children: [
              CustomButton(
                onTap: () async {
                  final mnemonic =
                      await GetIt.I<IBottomSheetService>().queueBottomSheet(
                    widget: RecoverFromSeed(),
                  );
                  if (mnemonic is String) {
                    await keysService.restoreWallet(mnemonic: mnemonic);
                    setState(() {});
                  }
                },
                child: const Center(
                  child: Text(
                    'Import account',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12.0),
          Row(
            children: [
              CustomButton(
                type: CustomButtonType.invalid,
                onTap: () async {
                  await keysService.loadDefaultWallet();
                  setState(() {});
                },
                child: const Center(
                  child: Text(
                    'Restore default',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _DataContainer extends StatefulWidget {
  const _DataContainer({
    required this.title,
    required this.data,
    this.blurred = false,
  });
  final String title;
  final String data;
  final bool blurred;

  @override
  State<_DataContainer> createState() => __DataContainerState();
}

class __DataContainerState extends State<_DataContainer> {
  late bool blurred;

  @override
  void initState() {
    super.initState();
    blurred = widget.blurred;
  }

  @override
  Widget build(BuildContext context) {
    final blurValue = blurred ? 5.0 : 0.0;
    return GestureDetector(
      onTap: () => Clipboard.setData(ClipboardData(text: widget.data)).then(
        (_) => showPlatformToast(
          child: Text('${widget.title} copied'),
          context: context,
        ),
      ),
      onLongPress: () => setState(() {
        blurred = false;
      }),
      onLongPressUp: () => setState(() {
        blurred = widget.blurred;
      }),
      child: Container(
        decoration: BoxDecoration(
          color: StyleConstants.lightGray,
          borderRadius: BorderRadius.circular(
            StyleConstants.linear16,
          ),
        ),
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  widget.title,
                  style: const TextStyle(
                    color: Colors.black,
                    fontSize: 14.0,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(width: 8.0),
                const Icon(Icons.copy, size: 14.0),
              ],
            ),
            ImageFiltered(
              imageFilter:
                  ImageFilter.blur(sigmaX: blurValue, sigmaY: blurValue),
              child: Text(
                widget.data,
                style: const TextStyle(
                  color: Colors.black87,
                  fontSize: 13.0,
                  fontWeight: FontWeight.w400,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
